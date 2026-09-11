(function installBladefallEquipmentEconomy(root) {
  'use strict';

  const SCHEMA = 'bladefall.equipment-economy';
  const VERSION = 2;
  const MATERIAL_IDS = Object.freeze(['iron', 'weave', 'prism', 'essence']);
  const MATERIALS = Object.freeze({
    iron: Object.freeze({ name: 'Memory Iron', color: '#aeb9c6', role: 'metal and impact equipment' }),
    weave: Object.freeze({ name: 'Pale Weave', color: '#c7d6b4', role: 'armor bindings and mobility equipment' }),
    prism: Object.freeze({ name: 'Dream Prism', color: '#8fd8ff', role: 'elemental tools and precision equipment' }),
    essence: Object.freeze({ name: 'Veiled Essence', color: '#c47bff', role: 'rare reforging and memory equipment' }),
  });
  const RARITY_TIER = Object.freeze({ common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 });
  const ARMOR_SLOTS = Object.freeze(['helmet', 'chest', 'legs']);
  const DISCIPLINES = Object.freeze({
    bulwark: Object.freeze({ id: 'bulwark', name: 'Bulwark', color: '#d9c29a', two: '+20 armor defense', three: '+5% chance banked toward a full-wound Ward' }),
    wayfarer: Object.freeze({ id: 'wayfarer', name: 'Wayfarer', color: '#9fd8c4', two: '+6% movement speed', three: '-12% dash cooldown' }),
    reaver: Object.freeze({ id: 'reaver', name: 'Reaver', color: '#e68c7d', two: '+6% weapon damage', three: '+8% attack speed' }),
  });
  const DISCIPLINE_IDS = Object.freeze(Object.keys(DISCIPLINES));
  const MAX_TOOL_RANK = 2;
  const TOOL_CALIBRATION_COSTS = Object.freeze([
    Object.freeze({ gold: 65, materials: Object.freeze({ prism: 3, weave: 2 }) }),
    Object.freeze({ gold: 155, materials: Object.freeze({ prism: 6, essence: 1 }) }),
  ]);
  const REINFORCE_COSTS = Object.freeze([
    Object.freeze({ gold: 45, materials: Object.freeze({ iron: 4, weave: 2 }) }),
    Object.freeze({ gold: 110, materials: Object.freeze({ iron: 8, weave: 5, prism: 2 }) }),
    Object.freeze({ gold: 240, materials: Object.freeze({ iron: 14, weave: 9, prism: 5, essence: 1 }) }),
  ]);

  const toolRows = [
    ['assessor-lens', 'Assessor Lens', 5, 'survey', ['inspect', 'reveal'], 'Reveals nearby memories, loot, and false walls.'],
    ['retrieval-coil', 'Retrieval Coil', 4, 'retrieve', ['pull', 'metal'], 'Draws one nearby loose item safely to your hand.'],
    ['cinder-capsule', 'Cinder Capsule', 3, 'cinder', ['fire', 'ignite'], 'Releases a short-lived ring of dream-fire.'],
    ['rime-ampoule', 'Rime Ampoule', 3, 'rime', ['ice', 'cool'], 'Releases a freezing pulse around the knight.'],
    ['grounding-spike', 'Grounding Spike', 3, 'ground', ['storm', 'conduct'], 'Grounds the knight and discharges nearby threats.'],
  ];
  const TOOLS = Object.freeze(Object.fromEntries(toolRows.map((row) => {
    const [id, name, maxCharges, action, tags, description] = row;
    return [id, Object.freeze({ id, name, maxCharges, action, tags: Object.freeze(tags), description })];
  })));
  const TOOL_IDS = Object.freeze(Object.keys(TOOLS));

  function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) output[key] = clone(item);
    return output;
  }

  function safeRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function cleanMaterials(raw) {
    const source = safeRecord(raw), output = {};
    for (const id of MATERIAL_IDS) output[id] = Math.max(0, Math.floor(Number(source[id]) || 0));
    return output;
  }

  function toolRank(raw, toolId) {
    return Math.max(0, Math.min(MAX_TOOL_RANK, Math.floor(Number(safeRecord(safeRecord(raw).toolRanks)[toolId]) || 0)));
  }

  function toolMaxCharges(raw, toolId) {
    return TOOLS[toolId] ? TOOLS[toolId].maxCharges + toolRank(raw, toolId) : 0;
  }

  function createState(raw) {
    const source = safeRecord(raw);
    const owned = [...new Set((Array.isArray(source.ownedTools) ? source.ownedTools : []).map(String))]
      .filter((id) => TOOLS[id]);
    const equippedTool = owned.includes(source.equippedTool) ? source.equippedTool : null;
    const charges = {}, toolRanks = {}, rawCharges = safeRecord(source.charges);
    for (const id of owned) {
      toolRanks[id] = toolRank(source, id);
      const supplied = Object.prototype.hasOwnProperty.call(rawCharges, id);
      const maxCharges=toolMaxCharges({toolRanks},id);
      charges[id] = Math.max(0, Math.min(maxCharges,
        supplied ? Math.floor(Number(rawCharges[id]) || 0) : maxCharges));
    }
    return {
      schema: SCHEMA,
      version: VERSION,
      materials: cleanMaterials(source.materials),
      ownedTools: owned,
      equippedTool,
      toolRanks,
      charges,
      salvageCount: Math.max(0, Math.floor(Number(source.salvageCount) || 0)),
      revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    };
  }

  function migrate(raw) {
    const state = createState(raw);
    const current = !!raw && raw.schema === SCHEMA && raw.version === VERSION;
    return Object.freeze({ state, receipt: Object.freeze({ changed: !current || JSON.stringify(raw) !== JSON.stringify(state), from: raw && raw.version || 0, to: VERSION }) });
  }

  function normalizeArmor(armor) {
    if (!armor || typeof armor !== 'object' || !ARMOR_SLOTS.includes(armor.slot)) return null;
    const output = clone(armor);
    output.rarity = RARITY_TIER[output.rarity] == null ? 'common' : output.rarity;
    output.armorSchema = SCHEMA;
    output.armorVersion = VERSION;
    output.reinforce = Math.max(0, Math.min(3, Math.floor(Number(output.reinforce) || 0)));
    output.baseDefense = Math.max(0, Number(output.baseDefense) || Number(output.defense) || 0);
    output.defense = Number((output.baseDefense * (1 + output.reinforce * 0.08)).toFixed(1));
    output.affixes = Array.isArray(output.affixes) ? output.affixes.map(clone) : [];
    if (!DISCIPLINES[output.discipline]) {
      const stats = new Set(output.affixes.map((row) => row && row.stat));
      output.discipline = stats.has('hp') ? 'bulwark'
        : stats.has('speedMul') || stats.has('dodgeMul') ? 'wayfarer' : 'reaver';
    }
    return output;
  }

  function disciplineProfile(gear) {
    const counts = Object.fromEntries(DISCIPLINE_IDS.map((id) => [id, 0]));
    for (const slot of ARMOR_SLOTS) {
      const armor = normalizeArmor(gear && gear[slot]);
      if (armor) counts[armor.discipline]++;
    }
    return Object.freeze({ counts: Object.freeze(counts),
      bulwark: Object.freeze({ two: counts.bulwark >= 2, three: counts.bulwark >= 3 }),
      wayfarer: Object.freeze({ two: counts.wayfarer >= 2, three: counts.wayfarer >= 3 }),
      reaver: Object.freeze({ two: counts.reaver >= 2, three: counts.reaver >= 3 }),
    });
  }

  function reinforcePlan(armor) {
    const normalized = normalizeArmor(armor);
    if (!normalized) return Object.freeze({ allowed: false, reason: 'armor-absent', cost: null });
    if (normalized.reinforce >= REINFORCE_COSTS.length)
      return Object.freeze({ allowed: false, reason: 'reinforce-maxed', cost: null });
    const cost = clone(REINFORCE_COSTS[normalized.reinforce]);
    return Object.freeze({
      allowed: true,
      reason: 'reinforce-ready',
      nextReinforce: normalized.reinforce + 1,
      defenseBefore: normalized.defense,
      defenseAfter: Number((normalized.baseDefense * (1 + (normalized.reinforce + 1) * 0.08)).toFixed(1)),
      cost: Object.freeze({ gold: cost.gold, materials: Object.freeze(cost.materials) }),
    });
  }

  function applyReinforce(armor) {
    const plan = reinforcePlan(armor);
    if (!plan.allowed) return Object.freeze({ ok: false, reason: plan.reason, armor: normalizeArmor(armor), plan });
    const output = normalizeArmor(armor);
    output.reinforce = plan.nextReinforce;
    output.defense = plan.defenseAfter;
    return Object.freeze({ ok: true, reason: 'reinforced', armor: output, plan });
  }

  function transferArmorProgress(fromArmor, toArmor) {
    const source = normalizeArmor(fromArmor), target = normalizeArmor(toArmor);
    if (!target) return null;
    if (!source || source.slot !== target.slot) return target;
    target.reinforce = source.reinforce;
    const generatedDiscipline=target.discipline;
    target.discipline = source.discipline;
    if(typeof target.name==='string'&&DISCIPLINES[generatedDiscipline]&&DISCIPLINES[source.discipline])
      target.name=target.name.replace(DISCIPLINES[generatedDiscipline].name,DISCIPLINES[source.discipline].name);
    target.defense = Number((target.baseDefense * (1 + target.reinforce * 0.08)).toFixed(1));
    return target;
  }

  function salvageQuote(item) {
    if (!item || typeof item !== 'object') return Object.freeze({ allowed: false, reason: 'invalid-item', materials: Object.freeze(cleanMaterials()) });
    const tier = RARITY_TIER[item.rarity];
    if (tier == null) return Object.freeze({ allowed: false, reason: 'invalid-rarity', materials: Object.freeze(cleanMaterials()) });
    const armor = ARMOR_SLOTS.includes(item.slot), weapon = typeof item.arche === 'string';
    if (!armor && !weapon) return Object.freeze({ allowed: false, reason: 'unsalvageable-item', materials: Object.freeze(cleanMaterials()) });
    const materials = cleanMaterials();
    materials.iron = (armor ? 2 : 3) + tier * 2;
    materials.weave = (armor ? 2 : 0) + tier;
    materials.prism = tier >= 2 ? tier - 1 + (item.el ? 1 : 0) : 0;
    materials.essence = tier >= 4 ? 1 : 0;
    return Object.freeze({ allowed: true, reason: 'salvage-ready', itemKind: armor ? 'armor' : 'weapon', rarity: item.rarity, materials: Object.freeze(materials) });
  }

  function credit(raw, materials, reason) {
    const state = createState(raw), gain = cleanMaterials(materials);
    for (const id of MATERIAL_IDS) state.materials[id] += gain[id];
    if (reason === 'salvage') state.salvageCount++;
    state.revision++;
    return Object.freeze({ ok: true, reason: reason || 'credited', state, gained: Object.freeze(gain) });
  }

  function wallet(raw, gold) {
    const state = createState(raw);
    return Object.freeze({ gold: Math.max(0, Math.floor(Number(gold) || 0)), materials: Object.freeze(clone(state.materials)) });
  }

  function affordability(raw, gold, cost) {
    const state = createState(raw), need = safeRecord(cost), materialCost = cleanMaterials(need.materials);
    const missing = {};
    for (const id of MATERIAL_IDS) if (state.materials[id] < materialCost[id]) missing[id] = materialCost[id] - state.materials[id];
    const goldCost = Math.max(0, Math.floor(Number(need.gold) || 0));
    return Object.freeze({
      allowed: Math.max(0, Math.floor(Number(gold) || 0)) >= goldCost && Object.keys(missing).length === 0,
      goldCost,
      materialCost: Object.freeze(materialCost),
      missingGold: Math.max(0, goldCost - Math.max(0, Math.floor(Number(gold) || 0))),
      missing: Object.freeze(missing),
    });
  }

  function spend(raw, gold, cost) {
    const state = createState(raw), plan = affordability(state, gold, cost);
    if (!plan.allowed) return Object.freeze({ ok: false, reason: 'insufficient-resources', state, gold: Math.max(0, Math.floor(Number(gold) || 0)), plan });
    for (const id of MATERIAL_IDS) state.materials[id] -= plan.materialCost[id];
    state.revision++;
    return Object.freeze({ ok: true, reason: 'spent', state, gold: Math.max(0, Math.floor(Number(gold) || 0)) - plan.goldCost, plan });
  }

  function acquireTool(raw, toolId) {
    const state = createState(raw), id = String(toolId || ''), tool = TOOLS[id];
    if (!tool) return Object.freeze({ ok: false, changed: false, reason: 'unknown-tool', state });
    if (state.ownedTools.includes(id)) return Object.freeze({ ok: true, changed: false, reason: 'already-owned', state, tool });
    state.ownedTools.push(id);
    state.toolRanks[id] = 0;
    state.charges[id] = toolMaxCharges(state,id);
    if (!state.equippedTool) state.equippedTool = id;
    state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'tool-acquired', state, tool });
  }

  function equipTool(raw, toolId) {
    const state = createState(raw), id = toolId == null ? null : String(toolId);
    if (id !== null && !state.ownedTools.includes(id)) return Object.freeze({ ok: false, reason: 'tool-not-owned', state });
    state.equippedTool = id;
    state.revision++;
    return Object.freeze({ ok: true, reason: id ? 'tool-equipped' : 'tool-unequipped', state, tool: id ? TOOLS[id] : null });
  }

  function toolUsePlan(raw) {
    const state = createState(raw), id = state.equippedTool, tool = id && TOOLS[id];
    if (!tool) return Object.freeze({ allowed: false, reason: 'tool-absent', state, tool: null, event: null });
    const charges = state.charges[id] || 0;
    if (charges <= 0) return Object.freeze({ allowed: false, reason: 'tool-empty', state, tool, event: null });
    const rank=state.toolRanks[id]||0;
    return Object.freeze({ allowed: true, reason: 'tool-ready', state, tool, charges, rank,
      event: Object.freeze({ type: 'tool:use', toolId: id, action: tool.action, tags: tool.tags, rank, potency: 1+rank*0.2 }) });
  }

  function consumeTool(raw) {
    const plan = toolUsePlan(raw);
    if (!plan.allowed) return Object.freeze({ ok: false, reason: plan.reason, state: plan.state, event: null });
    const state = createState(plan.state), id = state.equippedTool;
    state.charges[id]--;
    state.revision++;
    return Object.freeze({ ok: true, reason: 'tool-used', state, tool: TOOLS[id], event: plan.event, charges: state.charges[id] });
  }

  function refillTool(raw, toolId) {
    const state = createState(raw), id = String(toolId || state.equippedTool || '');
    if (!state.ownedTools.includes(id)) return Object.freeze({ ok: false, reason: 'tool-not-owned', state });
    const maxCharges=toolMaxCharges(state,id),changed = state.charges[id] !== maxCharges;
    state.charges[id] = maxCharges;
    if (changed) state.revision++;
    return Object.freeze({ ok: true, changed, reason: changed ? 'tool-refilled' : 'tool-full', state, tool: TOOLS[id] });
  }

  function calibrationPlan(raw, toolId) {
    const state=createState(raw),id=String(toolId||state.equippedTool||'');
    if(!state.ownedTools.includes(id))return Object.freeze({allowed:false,reason:'tool-not-owned',state,cost:null});
    const rank=state.toolRanks[id]||0;
    if(rank>=MAX_TOOL_RANK)return Object.freeze({allowed:false,reason:'calibration-maxed',state,cost:null,rank});
    const cost=clone(TOOL_CALIBRATION_COSTS[rank]);
    return Object.freeze({allowed:true,reason:'calibration-ready',state,tool:TOOLS[id],rank,nextRank:rank+1,
      chargesBefore:toolMaxCharges(state,id),chargesAfter:toolMaxCharges({toolRanks:{[id]:rank+1}},id),
      cost:Object.freeze({gold:cost.gold,materials:Object.freeze(cost.materials)})});
  }

  function applyCalibration(raw,toolId){
    const plan=calibrationPlan(raw,toolId);
    if(!plan.allowed)return Object.freeze({ok:false,reason:plan.reason,state:plan.state,plan});
    const state=createState(plan.state),id=String(toolId||state.equippedTool);state.toolRanks[id]=plan.nextRank;
    state.charges[id]=plan.chargesAfter;state.revision++;
    return Object.freeze({ok:true,reason:'tool-calibrated',state,tool:TOOLS[id],rank:plan.nextRank,plan});
  }

  function salvage(raw, item) {
    const quote = salvageQuote(item);
    if (!quote.allowed) return Object.freeze({ ok: false, reason: quote.reason, state: createState(raw), quote });
    const result = credit(raw, quote.materials, 'salvage');
    return Object.freeze({ ok: true, reason: 'salvaged', state: result.state, gained: quote.materials, quote });
  }

  function createController() {
    let counters = { salvages: 0, toolAcquisitions: 0, toolEquips: 0, toolUses: 0, reinforcements: 0, blocked: 0 };
    let last = null;
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("equipment-economy:createController", () => ({ counters, last }),
      state => ({ counters, last } = state));
    function record(type, detail) {
      if (type === 'salvage') counters.salvages++;
      else if (type === 'tool-acquired') counters.toolAcquisitions++;
      else if (type === 'tool-equipped') counters.toolEquips++;
      else if (type === 'tool-used') counters.toolUses++;
      else if (type === 'reinforced') counters.reinforcements++;
      else counters.blocked++;
      last = Object.freeze({ type, detail: detail == null ? null : String(detail) });
    }
    function diagnostics() { return Object.freeze({ ...counters, last }); }
    return Object.freeze({ record, diagnostics });
  }

  function validate() {
    const errors = [];
    if (MATERIAL_IDS.length !== 4) errors.push('economy requires four legible material families');
    if (DISCIPLINE_IDS.length !== 3) errors.push('armor requires three readable disciplines');
    if (TOOL_IDS.length !== 5) errors.push('tool foundation requires five distinct tools');
    if (new Set(TOOL_IDS.map((id) => TOOLS[id].action)).size !== TOOL_IDS.length) errors.push('every tool needs a distinct action');
    const quote = salvageQuote({ slot: 'chest', rarity: 'rare' });
    if (!quote.allowed || quote.materials.iron <= 0 || quote.materials.weave <= 0) errors.push('armor salvage must return metal and weave');
    const armor = normalizeArmor({ slot: 'helmet', rarity: 'common', defense: 10, affixes: [] });
    if (!armor || applyReinforce(armor).armor.defense <= armor.defense) errors.push('armor reinforcement must increase defense');
    let state = createState();
    state = acquireTool(state, TOOL_IDS[0]).state;
    if (!toolUsePlan(state).allowed || consumeTool(state).charges !== TOOLS[TOOL_IDS[0]].maxCharges - 1) errors.push('acquired tool must equip and consume deterministically');
    const calibrated=applyCalibration(state,TOOL_IDS[0]);if(!calibrated.ok||toolMaxCharges(calibrated.state,TOOL_IDS[0])!==TOOLS[TOOL_IDS[0]].maxCharges+1)errors.push('tool calibration must add bounded potency and one charge');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), materials: MATERIAL_IDS.length, tools: TOOL_IDS.length, armorSlots: ARMOR_SLOTS.length, disciplines:DISCIPLINE_IDS.length, reinforceTiers: REINFORCE_COSTS.length,toolRanks:MAX_TOOL_RANK });
  }

  root.BladefallEquipmentEconomy = Object.freeze({
    SCHEMA, VERSION, MATERIAL_IDS, MATERIALS, RARITY_TIER, ARMOR_SLOTS,DISCIPLINES,DISCIPLINE_IDS,
    REINFORCE_COSTS, TOOL_IDS, TOOLS,MAX_TOOL_RANK,TOOL_CALIBRATION_COSTS, createState, migrate, normalizeArmor,disciplineProfile,
    reinforcePlan, applyReinforce, transferArmorProgress, salvageQuote, salvage,
    credit, wallet, affordability, spend, acquireTool, equipTool, toolUsePlan,
    consumeTool, refillTool,toolRank,toolMaxCharges,calibrationPlan,applyCalibration, createController, validate,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
