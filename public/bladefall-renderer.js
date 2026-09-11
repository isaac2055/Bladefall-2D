(function installBladefallRenderer(root) {
  'use strict';

  const QUALITY_PROFILES = Object.freeze({
    low: Object.freeze({ name: 'low', maxParticles: 320, maxLights: 8, weatherDensity: 0.4 }),
    balanced: Object.freeze({ name: 'balanced', maxParticles: 560, maxLights: 16, weatherDensity: 0.7 }),
    high: Object.freeze({ name: 'high', maxParticles: 900, maxLights: 28, weatherDensity: 1 }),
  });
  const QUALITY_ORDER = Object.freeze(['low', 'balanced', 'high']);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createQualityController(options) {
    const settings = options || {};
    const targetMs = Number(settings.targetMs) || 16.667;
    const degradeFrames = Math.max(2, settings.degradeFrames || 45);
    const recoverFrames = Math.max(2, settings.recoverFrames || 360);
    let index = Math.max(0, QUALITY_ORDER.indexOf(settings.initial || 'high'));
    let slowFrames = 0;
    let fastFrames = 0;
    let ema = targetMs * 0.5;
    let forced = null;

    function observe(milliseconds) {
      if (!Number.isFinite(milliseconds) || milliseconds < 0) return profile();
      ema = ema * 0.92 + milliseconds * 0.08;
      if (forced) return profile();
      if (ema > targetMs * 1.05) {
        slowFrames++;
        fastFrames = 0;
        if (slowFrames >= degradeFrames && index > 0) {
          index--;
          slowFrames = 0;
        }
      } else if (ema < targetMs * 0.68) {
        fastFrames++;
        slowFrames = 0;
        if (fastFrames >= recoverFrames && index < QUALITY_ORDER.length - 1) {
          index++;
          fastFrames = 0;
        }
      } else {
        slowFrames = Math.max(0, slowFrames - 1);
        fastFrames = Math.max(0, fastFrames - 1);
      }
      return profile();
    }

    function force(name) {
      forced = QUALITY_PROFILES[name] ? name : null;
      return profile();
    }

    function profile() {
      return QUALITY_PROFILES[forced || QUALITY_ORDER[index]];
    }

    function diagnostics() {
      return Object.freeze({
        profile: profile().name,
        forced,
        averageFrameMs: +ema.toFixed(3),
        slowFrames,
        fastFrames,
      });
    }

    return Object.freeze({ observe, force, profile, diagnostics });
  }

  function rgba(color, alpha) {
    if (typeof color !== 'string' || color[0] !== '#') return color;
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map((part) => part + part).join('');
    const value = Number.parseInt(hex, 16);
    return `rgba(${value >> 16 & 255},${value >> 8 & 255},${value & 255},${clamp(alpha, 0, 1)})`;
  }

  function animationPose(kind, actor) {
    const value = actor || {};
    if (kind === 'hero') {
      const state = value.dead || value.downed ? 'down'
        : value.hurtFlash > 0 ? 'hurt'
          : value.dodgeTimer > 0 ? 'dash'
            : value.atkTimer > 0 ? 'attack'
              : value.charging ? 'charge'
                : !value.onGround ? (value.vy > 0 ? 'rise' : 'fall')
                  : Math.abs(value.vx || 0) > 20 ? 'run' : 'idle';
      const rotation = state === 'dash' ? -(value.face || 1) * 0.055
        : state === 'rise' || state === 'fall' ? clamp(-(value.vy || 0) / 9000, -0.045, 0.045)
          : clamp((value.vx || 0) / 6500, -0.035, 0.035);
      return Object.freeze({ state, rotation });
    }
    const state = value.dead ? 'down'
      : value.hitFlash > 0 ? 'hurt'
        : value.atkTimer > 0 || value.lunge > 0 ? 'attack'
          : Math.abs(value.vx || 0) > 12 ? 'move' : 'idle';
    return Object.freeze({ state, rotation: state === 'move' ? clamp((value.vx || 0) / 9000, -0.025, 0.025) : 0 });
  }

  function createRenderer(options) {
    const settings = options || {};
    const now = settings.now || (() => root.performance && root.performance.now ? root.performance.now() : Date.now());
    const createCanvas = settings.createCanvas || (() => root.document.createElement('canvas'));
    const quality = createQualityController(settings.quality);
    const lightCanvas = createCanvas();
    const lightContext = lightCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let frameStart = 0;
    let layerStart = 0;
    let activeLayer = null;
    let layers = {};
    let lights = [];
    let particleStats = { available: 0, drawn: 0 };
    let animationStates = {};
    let frame = 0;

    function beginFrame(nextWidth, nextHeight) {
      width = Math.max(1, nextWidth | 0);
      height = Math.max(1, nextHeight | 0);
      if (lightCanvas.width !== width) lightCanvas.width = width;
      if (lightCanvas.height !== height) lightCanvas.height = height;
      frameStart = now();
      layerStart = frameStart;
      activeLayer = null;
      layers = {};
      lights = [];
      particleStats = { available: 0, drawn: 0 };
      animationStates = {};
      frame++;
    }

    function beginLayer(name) {
      endLayer();
      activeLayer = name;
      layerStart = now();
    }

    function endLayer() {
      if (!activeLayer) return;
      layers[activeLayer] = (layers[activeLayer] || 0) + Math.max(0, now() - layerStart);
      activeLayer = null;
    }

    function addLight(light) {
      if (!light || !Number.isFinite(light.x) || !Number.isFinite(light.y)) return false;
      const radius = Math.max(8, Number(light.radius) || 80);
      lights.push({
        x: light.x,
        y: light.y,
        radius,
        color: light.color || '#ffffff',
        intensity: clamp(Number(light.intensity) || 0.5, 0.02, 1),
        score: radius * clamp(Number(light.intensity) || 0.5, 0.02, 1),
      });
      return true;
    }

    function selectParticles(particles, bounds) {
      const source = Array.isArray(particles) ? particles : [];
      particleStats.available = source.length;
      const minX = bounds && Number.isFinite(bounds.minX) ? bounds.minX : -Infinity;
      const maxX = bounds && Number.isFinite(bounds.maxX) ? bounds.maxX : Infinity;
      const visible = source.filter((particle) => particle.x >= minX && particle.x <= maxX);
      const limit = quality.profile().maxParticles;
      const selected = visible.length > limit ? visible.slice(visible.length - limit) : visible;
      particleStats.drawn = selected.length;
      return selected;
    }

    function sampleAnimation(kind, actor) {
      const pose = animationPose(kind, actor);
      const key = `${kind}:${pose.state}`;
      animationStates[key] = (animationStates[key] || 0) + 1;
      return pose;
    }

    function drawLighting(targetContext, profile) {
      if (!lightContext || !targetContext) return 0;
      const settings = profile || {};
      const darkness = clamp(Number(settings.darkness) || 0, 0, 0.8);
      const selected = lights
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, quality.profile().maxLights);
      lightContext.clearRect(0, 0, width, height);
      if (darkness > 0) {
        lightContext.globalCompositeOperation = 'source-over';
        lightContext.fillStyle = rgba(settings.ambient || '#05070d', darkness);
        lightContext.fillRect(0, 0, width, height);
      }
      lightContext.globalCompositeOperation = 'destination-out';
      for (const light of selected) {
        const gradient = lightContext.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
        gradient.addColorStop(0, `rgba(0,0,0,${0.78 * light.intensity})`);
        gradient.addColorStop(0.45, `rgba(0,0,0,${0.38 * light.intensity})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        lightContext.fillStyle = gradient;
        lightContext.fillRect(light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
      }
      lightContext.globalCompositeOperation = 'lighter';
      for (const light of selected) {
        const gradient = lightContext.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
        gradient.addColorStop(0, rgba(light.color, 0.22 * light.intensity));
        gradient.addColorStop(0.35, rgba(light.color, 0.09 * light.intensity));
        gradient.addColorStop(1, rgba(light.color, 0));
        lightContext.fillStyle = gradient;
        lightContext.fillRect(light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
      }
      lightContext.globalCompositeOperation = 'source-over';
      targetContext.save();
      targetContext.drawImage(lightCanvas, 0, 0);
      if (settings.grade && settings.gradeAlpha > 0) {
        targetContext.globalCompositeOperation = settings.gradeMode || 'soft-light';
        targetContext.fillStyle = rgba(settings.grade, settings.gradeAlpha);
        targetContext.fillRect(0, 0, width, height);
      }
      targetContext.restore();
      return selected.length;
    }

    function endFrame() {
      endLayer();
      const milliseconds = Math.max(0, now() - frameStart);
      quality.observe(milliseconds);
      return diagnostics();
    }

    function diagnostics() {
      const roundedLayers = {};
      for (const [name, value] of Object.entries(layers)) roundedLayers[name] = +value.toFixed(3);
      return Object.freeze({
        frame,
        quality: quality.diagnostics(),
        layers: Object.freeze(roundedLayers),
        lights: Object.freeze({ available: lights.length, budget: quality.profile().maxLights }),
        particles: Object.freeze({ ...particleStats, budget: quality.profile().maxParticles }),
        animationStates: Object.freeze({ ...animationStates }),
      });
    }

    return Object.freeze({
      beginFrame,
      beginLayer,
      endLayer,
      endFrame,
      addLight,
      selectParticles,
      sampleAnimation,
      drawLighting,
      quality,
      diagnostics,
    });
  }

  root.BladefallRenderer = Object.freeze({
    QUALITY_PROFILES,
    createQualityController,
    animationPose,
    createRenderer,
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
