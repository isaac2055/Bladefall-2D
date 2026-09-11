(function installBladefallRemix(root) {
  'use strict';

  const RULES = Object.freeze({
    'rift-renewal': Object.freeze({
      label: 'Rift Renewal',
      description: 'A personal portal traversal can restore one jump and the dash.',
    }),
    resonance: Object.freeze({
      label: 'Crystal Resonance',
      description: 'Air crystals leave a short-lived low-gravity echo.',
    }),
    'elemental-wake': Object.freeze({
      label: 'Elemental Wake',
      description: 'Elemental foes expire into a current carrying their element.',
    }),
    'field-cycle': Object.freeze({
      label: 'Living Weather',
      description: 'Authored air currents cycle through fire, frost, and storm.',
    }),
    'hazard-tide': Object.freeze({
      label: 'Hazard Tide',
      description: 'Neighboring timed hazards breathe as a traveling wave.',
    }),
    'marked-quarry': Object.freeze({
      label: 'Marked Quarry',
      description: 'Portal-routed enemies become rift-marked and pay out momentum.',
    }),
    'brittle-breath': Object.freeze({
      label: 'Brittle Breath',
      description: 'A collapsing crumble surface exhales a temporary updraft.',
    }),
  });

  const STAGES = Object.freeze([
    Object.freeze({ title: 'Surveyor’s Echo', ng1: 'resonance', ng2: 'rift-renewal' }),
    Object.freeze({ title: 'The Woods Recount', ng1: 'elemental-wake', ng2: 'hazard-tide' }),
    Object.freeze({ title: 'Falling Weight', ng1: 'rift-renewal', ng2: 'hazard-tide' }),
    Object.freeze({ title: 'The Third Note', ng1: 'field-cycle', ng2: 'resonance' }),
    Object.freeze({ title: 'Returned Tally', ng1: 'hazard-tide', ng2: 'marked-quarry' }),
    Object.freeze({ title: 'The Second Mason', ng1: 'marked-quarry', ng2: 'brittle-breath' }),
    Object.freeze({ title: 'Changing Sides', ng1: 'resonance', ng2: 'rift-renewal' }),
    Object.freeze({ title: 'Banked Winter', ng1: 'field-cycle', ng2: 'hazard-tide' }),
    Object.freeze({ title: 'Siphon Rhythm', ng1: 'elemental-wake', ng2: 'resonance' }),
    Object.freeze({ title: 'Courier’s Furnace', ng1: 'elemental-wake', ng2: 'brittle-breath' }),
    Object.freeze({ title: 'Returned Ember', ng1: 'field-cycle', ng2: 'marked-quarry' }),
    Object.freeze({ title: 'Two Floors Remember', ng1: 'marked-quarry', ng2: 'hazard-tide' }),
    Object.freeze({ title: 'Three Wounds', ng1: 'rift-renewal', ng2: 'marked-quarry' }),
    Object.freeze({ title: 'Stolen Doors', ng1: 'marked-quarry', ng2: 'brittle-breath' }),
    Object.freeze({ title: 'Gilded Misstep', ng1: 'brittle-breath', ng2: 'resonance' }),
    Object.freeze({ title: 'Speed Is a Debt', ng1: 'hazard-tide', ng2: 'brittle-breath' }),
  ]);

  function contractFor(stage, tier) {
    const index = Math.floor(Number(stage));
    const level = Math.max(0, Math.min(2, Math.floor(Number(tier) || 0)));
    const spec = STAGES[index];
    if (!spec || level < 1) return null;
    const ids = level >= 2 ? [spec.ng1, spec.ng2] : [spec.ng1];
    return Object.freeze({
      id: `remix-${index}-${level}`,
      stage: index,
      tier: level,
      title: spec.title,
      laws: Object.freeze(ids.map((id) => Object.freeze({ id, ...RULES[id] }))),
    });
  }

  function validateCatalog() {
    const issues = [];
    const titles = new Set();
    if (STAGES.length !== 16) issues.push('remix catalog must cover all 16 stages');
    STAGES.forEach((stage, index) => {
      if (!stage.title || titles.has(stage.title)) issues.push(`stage ${index} has a missing or duplicate title`);
      titles.add(stage.title);
      if (!RULES[stage.ng1]) issues.push(`stage ${index} has an unknown NG+1 law`);
      if (!RULES[stage.ng2]) issues.push(`stage ${index} has an unknown NG+2 law`);
      if (stage.ng1 === stage.ng2) issues.push(`stage ${index} repeats one law`);
    });
    return Object.freeze({ ok: issues.length === 0, stages: STAGES.length, rules: Object.keys(RULES).length,
      issues: Object.freeze(issues) });
  }

  function createDirector() {
    let current = null;
    let last = null;
    let counts = {};
    let cooldowns = {};
    // Private state participates in opt-in TAS branching.
    root.BladefallHarness?.register("remix:createDirector", () => ({ current, last, counts, cooldowns }),
      state => ({ current, last, counts, cooldowns } = state));

    function begin(stage, tier) {
      current = contractFor(stage, tier);
      last = null;
      for (const key of Object.keys(cooldowns)) delete cooldowns[key];
      return current;
    }

    function has(rule) {
      return !!(current && current.laws.some((law) => law.id === rule));
    }

    function trigger(rule, event, time, cooldown) {
      if (!has(rule)) return false;
      const now = Math.max(0, Number(time) || 0);
      const key = `${rule}:${event || 'event'}`;
      if ((cooldowns[key] || 0) > now) return false;
      cooldowns[key] = now + Math.max(0, Number(cooldown) || 0);
      counts[rule] = (counts[rule] || 0) + 1;
      last = Object.freeze({ rule, event: event || 'event', time: now });
      return true;
    }

    function diagnostics() {
      return Object.freeze({
        validation: validateCatalog(),
        contract: current,
        counts: Object.freeze({ ...counts }),
        last,
      });
    }

    return Object.freeze({ begin, has, trigger, diagnostics });
  }

  root.BladefallRemix = Object.freeze({
    RULES,
    STAGES,
    contractFor,
    validateCatalog,
    createDirector,
  });
})(typeof window !== 'undefined' ? window : globalThis);
