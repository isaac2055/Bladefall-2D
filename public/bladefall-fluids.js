(function installBladefallFluids(root) {
  'use strict';

  const Reactions = root.BladefallReactions || null;

  const TYPES = Object.freeze({
    water: Object.freeze({
      id: 'water', density: 1, buoyancy: 1720, drag: 3.2, damage: 0,
      surface: '#73d7f2', body: '#246e9b', deep: '#123958', foam: '#d8fbff', glow: null,
    }),
    lava: Object.freeze({
      id: 'lava', density: 0.82, buoyancy: 1320, drag: 4.8, damage: 22,
      surface: '#ffd36a', body: '#ec5a24', deep: '#64160d', foam: '#fff0a0', glow: '#ff7438',
    }),
    sludge: Object.freeze({
      id: 'sludge', density: 1.18, buoyancy: 1540, drag: 7.2, damage: 6,
      surface: '#a5cf58', body: '#4e6f2b', deep: '#202d1b', foam: '#d9ef9d', glow: null,
    }),
    void: Object.freeze({
      id: 'void', density: 0.7, buoyancy: 980, drag: 2.2, damage: 12,
      surface: '#c490ff', body: '#5b2a83', deep: '#1a0b2e', foam: '#ead6ff', glow: '#9c5cff',
    }),
  });

  const QUALITY_STRIDE = Object.freeze({ high: 1, balanced: 2, low: 3 });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function typeOf(value) {
    const id = typeof value === 'string' ? value : value && (value.kind || value.fluidKind);
    return TYPES[id] || TYPES.water;
  }

  function createVolume(spec) {
    const source = spec || {};
    const width = Math.max(24, Number(source.w) || 240);
    const cellSize = clamp(Number(source.cellSize) || 28, 12, 64);
    const count = clamp(Math.ceil(width / cellSize) + 1, 3, Number(source.maxColumns) || 64);
    const volume = {
      type: 'fluid',
      kind: typeOf(source).id,
      x: Number(source.x) || 0,
      y: Number(source.y) || 0,
      w: width,
      h: Math.max(4, Number(source.h) || 100),
      currentX: Number(source.currentX) || 0,
      currentY: Number(source.currentY) || 0,
      waveSpring: Number(source.waveSpring) || 34,
      waveDamping: Number(source.waveDamping) || 5.8,
      spread: Number(source.spread) || 18,
      transferRate: source.transferRate == null ? 1 : clamp(Number(source.transferRate) || 0, 0, 2),
      decorative: !!source.decorative,
      columns: Array.from({ length: count }, () => ({ offset: 0, velocity: 0 })),
      _fluidReady: true,
      _fluidTime: 0,
    };
    for (const key of ['id', 'run8Showcase', 'damage', 'buoyancy', 'drag', 'density',
      'surface', 'body', 'deep', 'foam', 'glow', 'jetLength', 'jetWidth']) {
      if (source[key] != null) volume[key] = source[key];
    }
    return volume;
  }

  function ensureVolume(object) {
    if (!object || object.type !== 'fluid') return null;
    if (object._fluidReady && Array.isArray(object.columns) && object.columns.length >= 3) return object;
    const initialized = createVolume(object);
    Object.assign(object, initialized);
    return object;
  }

  function columnX(volume, index) {
    return volume.x - volume.w / 2 + volume.w * index / (volume.columns.length - 1);
  }

  function surfaceAt(volume, x) {
    const value = ensureVolume(volume);
    if (!value) return -Infinity;
    const u = clamp((x - (value.x - value.w / 2)) / value.w, 0, 1) * (value.columns.length - 1);
    const left = Math.floor(u);
    const right = Math.min(value.columns.length - 1, left + 1);
    const t = u - left;
    return value.y + value.h
      + value.columns[left].offset * (1 - t)
      + value.columns[right].offset * t;
  }

  function containsPoint(volume, x, y, padding) {
    const value = ensureVolume(volume);
    const pad = Number(padding) || 0;
    return !!value
      && x >= value.x - value.w / 2 - pad
      && x <= value.x + value.w / 2 + pad
      && y >= value.y - pad
      && y <= surfaceAt(value, x) + pad;
  }

  function submersion(entity, volume, options) {
    const settings = options || {};
    const value = ensureVolume(volume);
    if (!entity || !value) return 0;
    const halfWidth = settings.centered ? Number(entity.size) || 2 : (Number(entity.w) || 0) / 2;
    if (entity.x + halfWidth < value.x - value.w / 2
      || entity.x - halfWidth > value.x + value.w / 2) return 0;
    const height = settings.centered
      ? Math.max(2, (Number(entity.size) || 2) * 2)
      : Math.max(2, Number(entity.h) || 40);
    const bottom = settings.centered ? (Number(entity.y) || 0) - height / 2 : Number(entity.y) || 0;
    const top = bottom + height;
    const surface = surfaceAt(value, Number(entity.x) || 0);
    return clamp((Math.min(top, surface) - Math.max(bottom, value.y)) / height, 0, 1);
  }

  function impulse(volume, x, amount, radius) {
    const value = ensureVolume(volume);
    if (!value || !Number.isFinite(x) || !Number.isFinite(amount)) return false;
    const nearest = Math.round(clamp(
      (x - (value.x - value.w / 2)) / value.w,
      0,
      1,
    ) * (value.columns.length - 1));
    const reach = Math.max(0, radius == null ? 1 : radius | 0);
    for (let offset = -reach; offset <= reach; offset++) {
      const index = nearest + offset;
      if (index < 0 || index >= value.columns.length) continue;
      const falloff = 1 - Math.abs(offset) / (reach + 1);
      value.columns[index].velocity += amount * falloff;
    }
    return true;
  }

  function stepVolume(volume, dt) {
    const value = ensureVolume(volume);
    if (!value) return null;
    const seconds = clamp(Number(dt) || 0, 0, 1 / 20);
    if (!seconds) return value;
    const offsets = value.columns.map((column) => column.offset);
    for (let index = 0; index < value.columns.length; index++) {
      const column = value.columns[index];
      const left = offsets[Math.max(0, index - 1)];
      const right = offsets[Math.min(offsets.length - 1, index + 1)];
      const neighborForce = (left + right - offsets[index] * 2) * value.spread;
      column.velocity += (-offsets[index] * value.waveSpring + neighborForce) * seconds;
      column.velocity *= Math.exp(-value.waveDamping * seconds);
      column.offset = clamp(column.offset + column.velocity * seconds, -value.h * 0.35, value.h * 0.35);
    }
    value._fluidTime += seconds;
    return value;
  }

  function normalizedPair(raw, index) {
    const portals = root.BladefallPortals;
    if (portals && typeof portals.normalizePair === 'function') return portals.normalizePair(raw, index);
    if (Array.isArray(raw)) return {
      id: raw.id || `pair-${index || 0}`, a: raw[0], b: raw[1], oneWay: !!raw[4],
    };
    return raw && { id: raw.id || `pair-${index || 0}`, a: raw.a, b: raw.b, oneWay: !!raw.oneWay };
  }

  function mouthFrame(mouth) {
    const portals = root.BladefallPortals;
    if (portals && typeof portals.mouthFrame === 'function') return portals.mouthFrame(mouth);
    const magnitude = Math.hypot(Number(mouth.nx) || 0, Number(mouth.ny) || 0) || 1;
    const nx = (Number(mouth.nx) || 0) / magnitude;
    const ny = (Number(mouth.ny) || 0) / magnitude;
    return { x: Number(mouth.x) || 0, y: Number(mouth.y) || 0, nx, ny, tx: -ny, ty: nx };
  }

  function portalJets(volumes, pairs) {
    const jets = [];
    const normalized = (pairs || []).map(normalizedPair).filter((pair) => pair && pair.a && pair.b);
    for (const pair of normalized) {
      for (let side = 0; side < 2; side++) {
        if (pair.oneWay && side === 1) continue;
        const entry = side === 0 ? pair.a : pair.b;
        const exit = side === 0 ? pair.b : pair.a;
        const source = (volumes || []).find((volume) => containsPoint(volume, entry.x, entry.y, 10));
        if (!source || source.decorative || source.transferRate <= 0) continue;
        const frame = mouthFrame(exit);
        const material = typeOf(source);
        jets.push({
          type: 'fluidJet',
          kind: material.id,
          x: frame.x,
          y: frame.y,
          nx: frame.nx,
          ny: frame.ny,
          length: Number(source.jetLength) || 280,
          w: Number(source.jetWidth) || 58,
          strength: (520 + Math.hypot(source.currentX, source.currentY)) * source.transferRate,
          damage: (source.damage == null ? material.damage : Number(source.damage)) * 0.55,
          source,
          pairId: pair.id,
        });
      }
    }
    return jets;
  }

  function jetSample(entity, jets, options) {
    const settings = options || {};
    const centered = !!settings.centered;
    const cy = centered ? Number(entity.y) || 0 : (Number(entity.y) || 0) + (Number(entity.h) || 40) / 2;
    const radius = centered ? Number(entity.size) || 2 : (Number(entity.w) || 0) / 2;
    let forceX = 0;
    let forceY = 0;
    let damagePerSecond = 0;
    const active = [];
    for (const jet of jets || []) {
      const frame = mouthFrame(jet);
      const rx = (Number(entity.x) || 0) - frame.x;
      const ry = cy - frame.y;
      const along = rx * frame.nx + ry * frame.ny;
      const across = rx * frame.tx + ry * frame.ty;
      if (along < -8 || along > jet.length || Math.abs(across) > jet.w / 2 + radius) continue;
      const falloff = 1 - clamp(along / jet.length, 0, 1) * 0.45;
      forceX += frame.nx * jet.strength * falloff;
      forceY += frame.ny * jet.strength * falloff;
      damagePerSecond += jet.damage || 0;
      active.push(jet);
    }
    return { forceX, forceY, damagePerSecond, active };
  }

  function sample(entity, volumes, jets, options) {
    const settings = options || {};
    let amount = 0;
    let forceX = 0;
    let forceY = 0;
    let drag = 0;
    let damagePerSecond = 0;
    let dominant = null;
    const active = [];
    for (const raw of volumes || []) {
      const volume = ensureVolume(raw);
      const immersed = submersion(entity, volume, settings);
      if (!immersed) continue;
      const material = typeOf(volume);
      const density = volume.density == null ? material.density : Number(volume.density);
      const buoyancy = volume.buoyancy == null ? material.buoyancy : Number(volume.buoyancy);
      const resistance = volume.drag == null ? material.drag : Number(volume.drag);
      forceX += (Number(volume.currentX) || 0) * immersed * resistance;
      forceY += ((Number(volume.currentY) || 0) + buoyancy * density) * immersed;
      drag = Math.max(drag, resistance * immersed);
      damagePerSecond += (volume.damage == null ? material.damage : Number(volume.damage)) * immersed;
      if (immersed > amount) {
        amount = immersed;
        dominant = volume;
      }
      active.push({ volume, submersion: immersed });
    }
    const fromJets = jetSample(entity, jets, settings);
    forceX += fromJets.forceX;
    forceY += fromJets.forceY;
    damagePerSecond += fromJets.damagePerSecond;
    return Object.freeze({
      submersion: amount,
      forceX,
      forceY,
      drag,
      damagePerSecond,
      dominant,
      active: Object.freeze(active),
      jets: Object.freeze(fromJets.active),
    });
  }

  function renderPoints(volume, quality) {
    const value = ensureVolume(volume);
    if (!value) return [];
    const stride = QUALITY_STRIDE[quality] || 1;
    const points = [];
    for (let index = 0; index < value.columns.length; index += stride) {
      points.push({ x: columnX(value, index), y: value.y + value.h + value.columns[index].offset });
    }
    const last = value.columns.length - 1;
    if ((last % stride) !== 0) points.push({ x: columnX(value, last), y: value.y + value.h + value.columns[last].offset });
    return points;
  }

  function createFluidSystem(options) {
    const settings = options || {};
    let volumes = [];
    let jets = [];
    let samples = 0;
    let impulses = 0;
    let activeColumns = 0;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("fluids:createFluidSystem", () => ({ volumes, jets, samples, impulses, activeColumns }),
      state => ({ volumes, jets, samples, impulses, activeColumns } = state));

    function update(objects, pairs, dt) {
      volumes = (objects || []).filter((object) => object && object.type === 'fluid').map(ensureVolume);
      activeColumns = 0;
      for (const volume of volumes) {
        if (Reactions) Reactions.stepState(volume, dt);
        stepVolume(volume, dt);
        activeColumns += volume.columns.length;
      }
      jets = portalJets(volumes, pairs);
      samples = 0;
      if (settings.events && typeof settings.events.emit === 'function' && jets.length) {
        settings.events.emit('fluid:portal-flow', { count: jets.length });
      }
      return Object.freeze({ volumes, jets });
    }

    function sampleEntity(entity, sampleOptions) {
      samples++;
      const result = sample(entity, volumes, jets, sampleOptions);
      const routedSource = result.jets && result.jets[0] && result.jets[0].source;
      const state = Reactions && Reactions.activeState(result.dominant || routedSource);
      if (!state) return result;
      let damagePerSecond = result.damagePerSecond;
      let drag = result.drag;
      if (state.id === 'flash-freeze' || state.id === 'obsidian-cool' || state.id === 'lava-quench') {
        damagePerSecond = 0;
        drag = Math.max(drag, state.id === 'flash-freeze' ? 12 : 8);
      } else if (state.id === 'conductive-surge') damagePerSecond += 9 * (result.submersion || (result.jets.length ? 1 : 0));
      else if (state.id === 'sludge-ignite') damagePerSecond += 13 * (result.submersion || (result.jets.length ? 1 : 0));
      else if (state.id === 'void-purge') damagePerSecond = 0;
      return Object.freeze({ ...result, damagePerSecond, drag, reaction: state });
    }

    function disturbAt(x, y, amount, radius) {
      const volume = volumes.find((candidate) => containsPoint(candidate, x, y, 16));
      if (!volume) return false;
      impulses++;
      return impulse(volume, x, amount, radius);
    }

    function diagnostics() {
      return Object.freeze({
        volumes: volumes.length,
        portalJets: jets.length,
        activeColumns,
        samples,
        impulses,
        kinds: Object.freeze(volumes.reduce((counts, volume) => {
          counts[volume.kind] = (counts[volume.kind] || 0) + 1;
          return counts;
        }, {})),
      });
    }

    return Object.freeze({
      update,
      sample: sampleEntity,
      impulse: disturbAt,
      renderPoints,
      diagnostics,
      get volumes() { return volumes; },
      get jets() { return jets; },
    });
  }

  root.BladefallFluids = Object.freeze({
    TYPES,
    QUALITY_STRIDE,
    typeOf,
    createVolume,
    ensureVolume,
    columnX,
    surfaceAt,
    containsPoint,
    submersion,
    impulse,
    stepVolume,
    portalJets,
    jetSample,
    sample,
    renderPoints,
    createFluidSystem,
  });
})(typeof window !== 'undefined' ? window : globalThis);
