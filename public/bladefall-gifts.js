(function installBladefallGifts(root) {
  'use strict';

  const SCHEMA = 'bladefall.gifts';
  const VERSION = 1;
  const GIFT_ROWS = [
    ['steadfast', 'Steadfast', 'warden', '#9fc4ff',
      'No altered rule. The knight meets the road exactly as it is.', []],
    ['blood-vow', 'Blood Vow', 'crimson', '#d85c62',
      'Losing a Blood measure empowers the next direct blade strike for six seconds.',
      [['player:wounded', 'blood-vow:prime', 6], ['weapon:melee-hit', 'damage:mul', 1.25]]],
    ['gilded-instinct', 'Gilded Instinct', 'gilded', '#e7c45d',
      'Stand still and nearby unclaimed caches, keys and sealed memories glint. It only shows what is already there.',
      [['exploration:observe', 'cache-sense:enable', 1]]],
    ['rime-step', 'Rime Step', 'frostbound', '#8fd8ff',
      'The first dash after touching ground leaves a brief slowing wake.',
      [['player:dash', 'rime-wake:enable', 1]]],
    ['cinder-oath', 'Cinder Oath', 'emberborn', '#ff9a5a',
      'The first melee strike after a dash kindles dream-fire.',
      [['weapon:melee-hit', 'dash-ember:enable', 1]]],
    ['hushed-shape', 'Hushed Shape', 'voidshade', '#b783ed',
      'Breaking sight and holding still makes ordinary enemies lose the trail sooner.',
      [['enemy:search', 'search-decay:mul', 1.35]]],
    ['rift-bloom', 'Rift Bloom', 'linewalker', '#7fe8ff',
      'Personal portal transit releases twin blooms and restores aerial movement on a cooldown.',
      [['portal:transit', 'rift-bloom:enable', 1]]],
  ];

  const GIFTS = Object.freeze(Object.fromEntries(GIFT_ROWS.map(([id, name, appearance, color, description, hooks]) => [id,
    Object.freeze({ id, name, appearance, color, description,
      hooks: Object.freeze(hooks.map(([event, operation, value]) => Object.freeze({ event, operation, value }))) })
  ])));
  const GIFT_IDS = Object.freeze(Object.keys(GIFTS));
  const APPEARANCE_GIFT = Object.freeze(Object.fromEntries(GIFT_IDS.map((id) => [GIFTS[id].appearance, id])));

  function safe(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function valid(values) { return [...new Set((Array.isArray(values) ? values : []).map(String))].filter((id) => GIFTS[id]); }

  function createState(raw) {
    const source = safe(raw), owned = valid(source.owned);
    if (!owned.includes('steadfast')) owned.unshift('steadfast');
    const equipped = owned.includes(source.equipped) ? source.equipped : 'steadfast';
    return { schema: SCHEMA, version: VERSION, owned, equipped,
      revision: Math.max(0, Math.floor(Number(source.revision) || 0)) };
  }

  function migrate(raw, legacy) {
    const recognized = raw && raw.schema === SCHEMA;
    const source = recognized ? raw : {};
    let state = createState(source), changed = !recognized;
    const save = safe(legacy), skins = safe(save.skinsOwned), kills = safe(save.bossTypeKills);
    const earned = { crimson: kills.brute > 0, gilded: kills.warden > 0,
      frostbound: kills.sorcerer > 0, emberborn: kills.colossus > 0,
      voidshade: kills.king > 0, linewalker: save.linewalkerUnlocked === true };
    for (const [appearance, giftId] of Object.entries(APPEARANCE_GIFT)) {
      if ((appearance === 'warden' || skins[appearance] || earned[appearance]) && !state.owned.includes(giftId)) {
        state.owned.push(giftId); changed = true;
      }
    }
    // Preserve the intent of an old selected perk while severing it from the
    // appearance itself. Crimson migrates to Blood Vow, never fractional healing.
    if (!recognized && APPEARANCE_GIFT[save.skin] && state.owned.includes(APPEARANCE_GIFT[save.skin])) {
      state.equipped = APPEARANCE_GIFT[save.skin]; changed = true;
    }
    return Object.freeze({ state: createState(state), receipt: Object.freeze({ changed, from: raw && raw.version || 0, to: VERSION }) });
  }

  function unlockForAppearance(raw, appearance) {
    const state = createState(raw), giftId = APPEARANCE_GIFT[String(appearance || '')];
    if (!giftId) return Object.freeze({ ok: false, changed: false, reason: 'unknown-appearance', state });
    if (state.owned.includes(giftId)) return Object.freeze({ ok: true, changed: false, reason: 'already-owned', state, gift: GIFTS[giftId] });
    state.owned.push(giftId); state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'gift-unlocked', state, gift: GIFTS[giftId] });
  }

  function equip(raw, giftId) {
    const state = createState(raw), id = String(giftId || '');
    if (!GIFTS[id]) return Object.freeze({ ok: false, changed: false, reason: 'unknown-gift', state });
    if (!state.owned.includes(id)) return Object.freeze({ ok: false, changed: false, reason: 'gift-locked', state });
    if (state.equipped === id) return Object.freeze({ ok: true, changed: false, reason: 'already-equipped', state, gift: GIFTS[id] });
    state.equipped = id; state.revision++;
    return Object.freeze({ ok: true, changed: true, reason: 'equipped', state, gift: GIFTS[id] });
  }

  function active(raw) { const state = createState(raw); return GIFTS[state.equipped] || GIFTS.steadfast; }
  function has(raw, giftId) { return createState(raw).equipped === giftId; }
  function uiModel(raw) {
    const state = createState(raw);
    return Object.freeze({ equipped: state.equipped, owned: state.owned.length, total: GIFT_IDS.length,
      rows: Object.freeze(GIFT_IDS.map((id) => Object.freeze({ ...GIFTS[id],
        status: state.equipped === id ? 'equipped' : state.owned.includes(id) ? 'owned' : 'locked' }))) });
  }
  function validate() {
    const errors = [];
    if (GIFT_IDS.length !== 7) errors.push('one Gift must correspond to each campaign appearance');
    if (GIFTS['blood-vow'].hooks.some((hook) => /life|heal/i.test(hook.operation))) errors.push('Blood Vow cannot use fractional healing');
    if (new Set(GIFT_IDS.map((id) => GIFTS[id].appearance)).size !== GIFT_IDS.length) errors.push('appearance-to-gift mapping must be one-to-one');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), gifts: GIFT_IDS.length, equippedLimit: 1 });
  }

  root.BladefallGifts = Object.freeze({ SCHEMA, VERSION, GIFT_IDS, GIFTS, APPEARANCE_GIFT,
    createState, migrate, unlockForAppearance, equip, active, has, uiModel, validate });
})(typeof globalThis !== 'undefined' ? globalThis : window);
