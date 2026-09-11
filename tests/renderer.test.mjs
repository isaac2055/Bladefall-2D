import test from 'node:test';
import assert from 'node:assert/strict';

await import('../public/bladefall-renderer.js');
const Renderer = globalThis.BladefallRenderer;

test('adaptive quality degrades only after sustained slow frames and can recover', () => {
  const quality = Renderer.createQualityController({ initial: 'high', degradeFrames: 3, recoverFrames: 3, targetMs: 10 });
  for (let i = 0; i < 20 && quality.profile().name === 'high'; i++) quality.observe(30);
  assert.equal(quality.profile().name, 'balanced');
  for (let i = 0; i < 80 && quality.profile().name !== 'high'; i++) quality.observe(1);
  assert.equal(quality.profile().name, 'high');
  quality.force('low');
  quality.observe(1);
  assert.equal(quality.profile().name, 'low');
});

test('animation sampler exposes stable semantic states and subtle poses', () => {
  assert.equal(Renderer.animationPose('hero', { onGround: true, vx: 0 }).state, 'idle');
  assert.equal(Renderer.animationPose('hero', { onGround: true, vx: 100 }).state, 'run');
  assert.equal(Renderer.animationPose('hero', { onGround: false, vy: 200 }).state, 'rise');
  assert.equal(Renderer.animationPose('hero', { dodgeTimer: 0.1, face: 1 }).state, 'dash');
  assert.equal(Renderer.animationPose('enemy', { hitFlash: 0.1 }).state, 'hurt');
});

test('renderer budgets particles, lights, and records layer diagnostics', () => {
  let clock = 0;
  const gradients = [];
  const context = {
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    clearRect() {},
    fillRect() {},
    save() {},
    restore() {},
    drawImage() {},
    createRadialGradient() {
      const gradient = { addColorStop(offset, color) { gradients.push([offset, color]); } };
      return gradient;
    },
  };
  const canvas = { width: 0, height: 0, getContext: () => context };
  const renderer = Renderer.createRenderer({
    now: () => ++clock,
    createCanvas: () => canvas,
    quality: { initial: 'low' },
  });

  renderer.beginFrame(1280, 720);
  renderer.beginLayer('world');
  const particles = Array.from({ length: 500 }, (_, index) => ({ x: index, y: 0 }));
  assert.equal(renderer.selectParticles(particles, { minX: 0, maxX: 499 }).length, 320);
  for (let i = 0; i < 20; i++) renderer.addLight({ x: i * 10, y: 50, radius: 100, color: '#fff', intensity: 1 });
  assert.equal(renderer.drawLighting(context, { darkness: 0.2, ambient: '#000' }), 8);
  renderer.endFrame();

  const diagnostics = renderer.diagnostics();
  assert.equal(diagnostics.particles.drawn, 320);
  assert.equal(diagnostics.lights.available, 20);
  assert.ok(diagnostics.layers.world > 0);
  assert.ok(gradients.length > 0);
});
