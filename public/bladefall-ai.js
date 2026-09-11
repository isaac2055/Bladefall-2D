(function installBladefallAI(root) {
  'use strict';

  const NAV_DEFAULTS = Object.freeze({
    stepHeight: 28,
    stepGap: 34,
    jumpHeight: 265,
    jumpDistance: 330,
    maxDrop: 520,
    portalReachY: 82,
  });

  const ROLES = Object.freeze({
    grunt: 'pursuer',
    emberling: 'pursuer',
    frostling: 'pursuer',
    toxling: 'controller',
    shadeling: 'skirmisher',
    rifthound: 'charger',
    sporecaster: 'artillery',
    stormmote: 'artillery',
    gargoyle: 'artillery',
    flyer: 'diver',
    sparkling: 'diver',
    crawler: 'diver',
    voidbat: 'diver',
    bloodeye: 'diver',
  });

  const ABILITIES = Object.freeze({
    charge: Object.freeze({
      id: 'charge', windup: 0.42, cooldown: 2.5, minRange: 105, maxRange: 430,
      token: 'melee', telegraph: '!',
    }),
    blink: Object.freeze({
      id: 'blink', windup: 0.3, cooldown: 3.1, minRange: 45, maxRange: 245,
      token: 'melee', telegraph: 'SHIFT',
    }),
    zone: Object.freeze({
      id: 'zone', windup: 0.58, cooldown: 3.2, minRange: 35, maxRange: 340,
      token: 'ranged', telegraph: 'SPORES',
    }),
    shoot: Object.freeze({
      id: 'shoot', windup: 0.32, cooldown: 0, minRange: 80, maxRange: 880,
      token: 'ranged', telegraph: 'AIM',
    }),
    dive: Object.freeze({
      id: 'dive', windup: 0.38, cooldown: 3.35, minRange: 90, maxRange: 540,
      token: 'melee', telegraph: '!',
    }),
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roleFor(entity) {
    if (!entity) return 'pursuer';
    if (entity.aiRole) return entity.aiRole;
    return ROLES[entity.type] || (entity.ranged ? 'artillery' : entity.kind === 'fly' ? 'diver' : 'pursuer');
  }

  function platformSurface(object, index) {
    if (!object || object.type !== 'plat' || object.gone || object.ceiling || object.fake
      || object.invisible && !object.revealed || object.move) return null;
    const width = Math.max(1, Number(object.w) || 0);
    return {
      id: index,
      object,
      x: Number(object.x) || 0,
      y: Number(object.y) || 0,
      left: (Number(object.x) || 0) - width / 2,
      right: (Number(object.x) || 0) + width / 2,
      width,
    };
  }

  function horizontalGap(a, b) {
    if (a.right < b.left) return b.left - a.right;
    if (b.right < a.left) return a.left - b.right;
    return 0;
  }

  function blocksConnection(a, b, obstacles) {
    const lo = Math.min(a.x, b.x);
    const hi = Math.max(a.x, b.x);
    const floor = Math.min(a.y, b.y) - 20;
    const roof = Math.max(a.y, b.y) + 190;
    for (const object of obstacles || []) {
      if (!object || object.gone) continue;
      const solid = object.type === 'wall'
        || object.type === 'door' && !object._aiOpen;
      if (!solid || object.x <= lo || object.x >= hi) continue;
      const bottom = (Number(object.y) || 0) - (Number(object.h) || 0);
      const top = Number(object.y) || 0;
      if (top > floor && bottom < roof) return true;
    }
    return false;
  }

  function directedEdge(a, b, obstacles, options) {
    const settings = options || NAV_DEFAULTS;
    const gap = horizontalGap(a, b);
    const rise = b.y - a.y;
    if (blocksConnection(a, b, obstacles)) return null;
    let type = null;
    if (gap <= settings.stepGap && Math.abs(rise) <= settings.stepHeight) type = 'walk';
    else if (gap <= settings.jumpDistance && rise <= settings.jumpHeight && rise >= -settings.maxDrop) {
      type = rise < -settings.stepHeight && gap <= settings.stepGap ? 'drop' : 'jump';
    }
    if (!type) return null;
    const rightward = b.x >= a.x;
    const overlapLeft = Math.max(a.left, b.left);
    const overlapRight = Math.min(a.right, b.right);
    const overlap = overlapRight >= overlapLeft;
    const takeoffX = overlap
      ? clamp(b.x, a.left + 16, a.right - 16)
      : rightward ? a.right - 16 : a.left + 16;
    const landingX = overlap
      ? clamp(a.x, b.left + 16, b.right - 16)
      : rightward ? b.left + 18 : b.right - 18;
    return {
      from: a.id,
      to: b.id,
      type,
      takeoffX,
      landingX,
      cost: Math.hypot(b.x - a.x, rise) + (type === 'jump' ? 95 : type === 'drop' ? 35 : 0),
    };
  }

  function buildPlatformGraph(obstacles, options) {
    const settings = Object.assign({}, NAV_DEFAULTS, options || {});
    const nodes = [];
    for (const object of obstacles || []) {
      const node = platformSurface(object, nodes.length);
      if (node) nodes.push(node);
    }
    const edges = nodes.map(() => []);
    for (let from = 0; from < nodes.length; from++) {
      for (let to = 0; to < nodes.length; to++) {
        if (from === to) continue;
        const edge = directedEdge(nodes[from], nodes[to], obstacles, settings);
        if (edge) edges[from].push(edge);
      }
      edges[from].sort((a, b) => a.cost - b.cost || a.to - b.to);
    }
    return { nodes, edges, settings, obstacles };
  }

  function nodeForPoint(graph, point, reachY) {
    if (!graph || !graph.nodes.length || !point) return null;
    const x = Number(point.x) || 0;
    const y = Number(point.y) || 0;
    let best = null;
    let score = Infinity;
    for (const node of graph.nodes) {
      const dx = x < node.left ? node.left - x : x > node.right ? x - node.right : 0;
      const dy = Math.abs(y - node.y);
      if (reachY != null && dy > reachY) continue;
      const next = dx * 1.8 + dy;
      if (next < score) {
        score = next;
        best = node;
      }
    }
    return best;
  }

  function normalizePair(raw, index) {
    const portals = root.BladefallPortals;
    if (portals && typeof portals.normalizePair === 'function') return portals.normalizePair(raw, index);
    if (Array.isArray(raw)) return {
      id: raw.id || `pair-${index || 0}`, a: raw[0], b: raw[1], oneWay: !!raw[4],
    };
    return raw;
  }

  function portalEdges(graph, pairs) {
    const edges = graph.nodes.map(() => []);
    const normalized = (pairs || []).map(normalizePair).filter((pair) => pair && pair.a && pair.b);
    for (const pair of normalized) {
      for (let side = 0; side < 2; side++) {
        if (pair.oneWay && side === 1) continue;
        const entry = side === 0 ? pair.a : pair.b;
        const exit = side === 0 ? pair.b : pair.a;
        const from = nodeForPoint(graph, entry, graph.settings.portalReachY);
        const to = nodeForPoint(graph, exit, graph.settings.portalReachY);
        if (!from || !to || from === to) continue;
        edges[from.id].push({
          from: from.id,
          to: to.id,
          type: 'portal',
          takeoffX: entry.x,
          landingX: exit.x,
          entry,
          exit,
          pair,
          cost: 42,
        });
      }
    }
    return edges;
  }

  function shortestPath(graph, start, goal, pairs) {
    if (!graph || !start || !goal) return null;
    if (start.id === goal.id) return { nodes: [start], edges: [], cost: 0 };
    const count = graph.nodes.length;
    const distance = Array(count).fill(Infinity);
    const previous = Array(count).fill(null);
    const visited = Array(count).fill(false);
    const portals = portalEdges(graph, pairs);
    distance[start.id] = 0;
    for (let pass = 0; pass < count; pass++) {
      let current = -1;
      let best = Infinity;
      for (let index = 0; index < count; index++) {
        if (!visited[index] && distance[index] < best) {
          current = index;
          best = distance[index];
        }
      }
      if (current < 0 || current === goal.id) break;
      visited[current] = true;
      const neighbors = graph.edges[current].concat(portals[current]);
      for (const edge of neighbors) {
        const next = best + edge.cost;
        if (next < distance[edge.to]) {
          distance[edge.to] = next;
          previous[edge.to] = edge;
        }
      }
    }
    if (!Number.isFinite(distance[goal.id])) return null;
    const routeEdges = [];
    let cursor = goal.id;
    while (cursor !== start.id) {
      const edge = previous[cursor];
      if (!edge) return null;
      routeEdges.unshift(edge);
      cursor = edge.from;
    }
    const routeNodes = [start];
    for (const edge of routeEdges) routeNodes.push(graph.nodes[edge.to]);
    return { nodes: routeNodes, edges: routeEdges, cost: distance[goal.id] };
  }

  function planNavigation(graph, actor, target, pairs) {
    const actorPoint = { x: actor.x, y: actor.y };
    const targetPoint = { x: target.x, y: target.y };
    if (actor.kind === 'fly') {
      return {
        reachable: true,
        direct: true,
        cost: Math.hypot(target.x - actor.x, target.y - actor.y),
        waypoint: targetPoint,
        action: 'fly',
        route: [],
      };
    }
    const start = nodeForPoint(graph, actorPoint);
    const goal = nodeForPoint(graph, targetPoint);
    const path = shortestPath(graph, start, goal, pairs);
    if (!path) {
      return {
        reachable: false,
        direct: true,
        cost: Math.hypot(target.x - actor.x, target.y - actor.y),
        waypoint: targetPoint,
        action: 'walk',
        route: [],
      };
    }
    const edge = path.edges[0] || null;
    const lastEdge = path.edges[path.edges.length - 1] || null;
    const approach = edge ? Math.abs(actor.x - edge.takeoffX) : Math.abs(target.x - actor.x);
    const finish = lastEdge ? Math.abs(target.x - lastEdge.landingX) : 0;
    return {
      reachable: true,
      direct: !edge,
      cost: path.cost + approach + finish,
      waypoint: edge ? { x: edge.takeoffX, y: start.y } : targetPoint,
      action: edge ? edge.type : 'walk',
      edge,
      route: path.nodes.map((node) => node.id),
    };
  }

  function navigationIntent(graph, actor, target, pairs, options) {
    const settings = options || {};
    const plan = planNavigation(graph, actor, target, pairs);
    const dx = plan.waypoint.x - actor.x;
    const nearTakeoff = Math.abs(dx) <= (settings.takeoffTolerance || 28);
    const grounded = settings.grounded == null ? Math.abs(actor.vy || 0) < 1 : !!settings.grounded;
    return Object.freeze({
      plan,
      move: Math.sign(dx || target.x - actor.x),
      jump: plan.action === 'jump' && nearTakeoff && grounded,
      jumpVelocity: settings.jumpVelocity || 570,
      action: plan.action,
      waypoint: plan.waypoint,
      distance: plan.cost,
    });
  }

  function lineOfSight(from, to, obstacles) {
    const ax = Number(from.x) || 0;
    const ay = (Number(from.y) || 0) + (Number(from.h) || 0) * 0.55;
    const bx = Number(to.x) || 0;
    const by = (Number(to.y) || 0) + (Number(to.h) || 0) * 0.55;
    const dx = bx - ax;
    const dy = by - ay;
    for (const object of obstacles || []) {
      if (!object || object.gone) continue;
      const solid = object.type === 'wall' || object.type === 'door' && !object._aiOpen;
      if (!solid) continue;
      const left = object.x - (object.w || 0) / 2;
      const right = object.x + (object.w || 0) / 2;
      if (right <= Math.min(ax, bx) || left >= Math.max(ax, bx)) continue;
      const t = dx ? clamp((object.x - ax) / dx, 0, 1) : 0;
      const y = ay + dy * t;
      if (y >= object.y - object.h && y <= object.y) return false;
    }
    return true;
  }

  function abilitiesFor(entity) {
    const ids = [];
    if (entity.type === 'rifthound') ids.push('charge');
    if (entity.type === 'shadeling') ids.push('blink');
    if (entity.type === 'toxling') ids.push('zone');
    if (entity.ranged && !entity.railSniper) ids.push('shoot');
    if (roleFor(entity) === 'diver') ids.push('dive');
    return ids;
  }

  function cooldown(entity, ability) {
    const store = entity._aiCooldowns || {};
    return Number(store[ability]) || 0;
  }

  function chooseAbility(entity, context) {
    const value = context || {};
    if (entity._aiWindup || value.canAttack === false) return null;
    const distance = Math.abs(Number(value.distance) || 0);
    let best = null;
    let bestScore = -Infinity;
    for (const id of abilitiesFor(entity)) {
      const ability = ABILITIES[id];
      if (cooldown(entity, id) > 0 || distance < ability.minRange || distance > ability.maxRange) continue;
      if ((id === 'shoot' || id === 'zone') && value.lineOfSight === false) continue;
      const center = (ability.minRange + ability.maxRange) / 2;
      const half = Math.max(1, (ability.maxRange - ability.minRange) / 2);
      let score = 1 - Math.abs(distance - center) / half;
      if (id === 'shoot' && roleFor(entity) === 'artillery') score += 0.35;
      if (id === 'charge' && distance > 180) score += 0.28;
      if (id === 'blink' && value.targetFacingEntity) score += 0.22;
      if (id === 'dive' && Math.abs(value.verticalDistance || 0) > 45) score += 0.18;
      if (score > bestScore) {
        bestScore = score;
        best = ability;
      }
    }
    return best ? Object.freeze({ ...best, score: bestScore }) : null;
  }

  function beginAbility(entity, ability, context) {
    if (!entity || !ability || entity._aiWindup) return false;
    entity._aiCooldowns = entity._aiCooldowns || {};
    entity._aiCooldowns[ability.id] = ability.cooldown || (ability.id === 'shoot' ? entity.shootCd || 2.2 : 1);
    entity._aiWindup = {
      id: ability.id,
      timer: ability.windup,
      initial: ability.windup,
      targetX: context && context.target ? context.target.x : entity.x,
      targetY: context && context.target ? context.target.y : entity.y,
      direction: context && context.direction || 1,
    };
    return true;
  }

  function stepAbility(entity, dt) {
    entity._aiCooldowns = entity._aiCooldowns || {};
    for (const id of Object.keys(entity._aiCooldowns)) {
      entity._aiCooldowns[id] = Math.max(0, entity._aiCooldowns[id] - dt);
    }
    const windup = entity._aiWindup;
    if (!windup) return null;
    windup.timer -= dt;
    if (windup.timer > 0) return Object.freeze({
      id: windup.id,
      phase: 'windup',
      progress: clamp(1 - windup.timer / windup.initial, 0, 1),
      state: windup,
    });
    entity._aiWindup = null;
    return Object.freeze({ id: windup.id, phase: 'execute', progress: 1, state: windup });
  }

  function selectTarget(entity, candidates, previousId) {
    const live = (candidates || []).filter((candidate) => candidate && candidate.entity
      && !candidate.entity.dead && !candidate.entity.downed && !candidate.hidden);
    if (!live.length) return null;
    let best = null;
    let bestScore = Infinity;
    for (const candidate of live) {
      const target = candidate.entity;
      let score = Math.hypot(target.x - entity.x, target.y - entity.y);
      if (candidate.id === previousId) score *= 0.82;
      if (score < bestScore || score === bestScore && String(candidate.id) < String(best && best.id)) {
        best = candidate;
        bestScore = score;
      }
    }
    return best && Object.freeze({ ...best, distance: bestScore });
  }

  function createEncounterDirector() {
    let directives = (root.BladefallHarness ? new Map() : new WeakMap());
    let snapshot = { nearby: 0, engaged: 0, meleeTokens: 0, rangedTokens: 0, roles: {} };
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("ai:createEncounterDirector", () => ({ directives, snapshot }),
      state => ({ directives, snapshot } = state));

    function beginFrame(enemies, targets, options) {
      directives = (root.BladefallHarness ? new Map() : new WeakMap());
      const settings = options || {};
      const target = targets && targets[0] && targets[0].entity;
      if (!target) return;
      const viewport = Math.max(640, Number(settings.viewport) || 1280);
      const stage = Number(settings.stage) || 0;
      const nearby = (enemies || []).filter((enemy) => enemy && !enemy.dead && !enemy.boss)
        .map((enemy) => ({
          enemy,
          distance: Math.abs(enemy.x - target.x) + Math.abs(enemy.y - target.y) * 0.35,
        }))
        .filter((item) => item.enemy.active || item.distance < viewport * 0.82)
        .sort((a, b) => a.distance - b.distance || (a.enemy.aiId || 0) - (b.enemy.aiId || 0));
      const cap = clamp(4 + Math.floor(stage / 4), 4, 7);
      let meleeTokens = 0;
      let rangedTokens = 0;
      let meleeSlots = 0;
      let rangedSlots = 0;
      const roles = {};
      for (let index = 0; index < nearby.length; index++) {
        const enemy = nearby[index].enemy;
        const role = roleFor(enemy);
        roles[role] = (roles[role] || 0) + 1;
        const engage = index < cap;
        const tokenKind = role === 'artillery' || role === 'controller' ? 'ranged' : 'melee';
        const tokenLimit = tokenKind === 'ranged' ? 2 : 2;
        const used = tokenKind === 'ranged' ? rangedTokens : meleeTokens;
        const attack = engage && used < tokenLimit;
        if (attack) {
          if (tokenKind === 'ranged') rangedTokens++;
          else meleeTokens++;
        }
        const side = enemy.x === target.x
          ? ((enemy.aiId || index) % 2 ? 1 : -1)
          : Math.sign(enemy.x - target.x);
        if (engage) {
          if (tokenKind === 'ranged') rangedSlots++;
          else meleeSlots++;
        }
        const rank = tokenKind === 'ranged' ? rangedSlots : meleeSlots;
        const radius = tokenKind === 'ranged'
          ? 320 + Math.max(0, rank - 1) * 72
          : role === 'diver' ? 145 + Math.max(0, rank - 1) * 54
            : 58 + Math.max(0, rank - 1) * 42;
        directives.set(enemy, Object.freeze({
          engage,
          attack,
          token: attack ? tokenKind : null,
          role,
          slotX: engage ? target.x + side * radius : enemy.spawnX,
          pressure: engage ? 1 - index / Math.max(1, cap) : 0,
        }));
      }
      snapshot = {
        nearby: nearby.length,
        engaged: Math.min(cap, nearby.length),
        meleeTokens,
        rangedTokens,
        roles,
      };
    }

    function directive(entity) {
      return directives.get(entity) || Object.freeze({
        engage: false,
        attack: false,
        token: null,
        role: roleFor(entity),
        slotX: entity.spawnX,
        pressure: 0,
      });
    }

    function diagnostics() {
      return Object.freeze({ ...snapshot, roles: Object.freeze({ ...snapshot.roles }) });
    }

    return Object.freeze({ beginFrame, directive, diagnostics });
  }

  function worldSignature(obstacles) {
    let signature = `${(obstacles || []).length}:`;
    for (const object of obstacles || []) {
      if (object.type === 'door') signature += object._aiOpen ? '1' : '0';
      else if (object.type === 'plat' && (object.gone || object.move)) signature += object.gone ? 'g' : 'm';
    }
    return signature;
  }

  function createAI(options) {
    const settings = options || {};
    const director = createEncounterDirector();
    let graph = null;
    let signature = '';
    let worldRef = null;
    let pairs = [];
    let plans = 0;
    let decisions = 0;
    let lastAction = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("ai:createAI", () => ({ graph, signature, worldRef, pairs, plans, decisions, lastAction }),
      state => ({ graph, signature, worldRef, pairs, plans, decisions, lastAction } = state));

    function beginFrame(enemies, targets, obstacles, portalPairs, frameOptions) {
      const nextSignature = worldSignature(obstacles);
      if (!graph || obstacles !== worldRef || nextSignature !== signature) {
        graph = buildPlatformGraph(obstacles, settings.navigation);
        signature = nextSignature;
        worldRef = obstacles;
      }
      pairs = portalPairs || [];
      plans = 0;
      decisions = 0;
      director.beginFrame(enemies, targets, frameOptions);
    }

    function plan(entity, target, planOptions) {
      plans++;
      const result = navigationIntent(graph, entity, target, pairs, planOptions);
      lastAction = result.action;
      return result;
    }

    function decide(entity, context) {
      decisions++;
      const result = chooseAbility(entity, context);
      if (result) lastAction = result.id;
      return result;
    }

    function diagnostics() {
      return Object.freeze({
        platforms: graph ? graph.nodes.length : 0,
        edges: graph ? graph.edges.reduce((sum, list) => sum + list.length, 0) : 0,
        plans,
        decisions,
        lastAction,
        encounter: director.diagnostics(),
      });
    }

    return Object.freeze({
      beginFrame,
      plan,
      decide,
      beginAbility,
      stepAbility,
      directive: director.directive,
      lineOfSight: (from, to) => lineOfSight(from, to, graph && graph.obstacles),
      roleFor,
      diagnostics,
      get graph() { return graph; },
    });
  }

  root.BladefallAI = Object.freeze({
    NAV_DEFAULTS,
    ROLES,
    ABILITIES,
    roleFor,
    platformSurface,
    horizontalGap,
    buildPlatformGraph,
    nodeForPoint,
    portalEdges,
    shortestPath,
    planNavigation,
    navigationIntent,
    lineOfSight,
    abilitiesFor,
    chooseAbility,
    beginAbility,
    stepAbility,
    selectTarget,
    createEncounterDirector,
    createAI,
  });
})(typeof window !== 'undefined' ? window : globalThis);
