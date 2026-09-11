import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'docs/baseline/a1-structural-baseline.json');
const A1_CAPTURE_VERSION = '7.8.0';

await import('../public/bladefall-authoring.js');
await import('../public/bladefall-campaign.js');

const Campaign = globalThis.BladefallCampaign;

function digest(data) {
  return createHash('sha256').update(data).digest('hex');
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function sourceCounts(blueprints) {
  return blueprints.reduce((counts, blueprint) => {
    counts[blueprint.source] = (counts[blueprint.source] || 0) + 1;
    return counts;
  }, {});
}

function capturePlan(blueprint) {
  const actCenters = blueprint.acts.map((act, index) => ({
    id: `act-${String(index + 1).padStart(2, '0')}`,
    label: act,
    normalizedX: +((index + 0.5) / blueprint.acts.length).toFixed(4),
    views: blueprint.systems.some((system) =>
      /updraft|vertical|gravity|ceiling|wall-jump|minecart|moving/.test(system))
      ? ['route', 'upper-layer']
      : ['route'],
  }));
  const dynamicSystems = blueprint.systems.filter((system) =>
    /portal|moving|wind|updraft|water|lava|gravity|furnace|pendulum|rotor|boss|minecart|collapsing|signal|spell|projectile/.test(system));
  const clips = dynamicSystems.map((system) => ({
    system,
    requirement: `Record setup, activation, failure/recovery, and successful resolution for ${system}.`,
  }));
  if (blueprint.stage.boss) {
    clips.push({
      system: `boss-${blueprint.stage.boss}`,
      requirement: 'Record every boss phase, one player death/restart, and the winning resolution.',
    });
  }
  return {
    status: 'pending-visual-capture',
    stills: [
      { id: 'entrance', normalizedX: 0, views: ['route'] },
      ...actCenters,
      { id: 'exit', normalizedX: 1, views: ['route'] },
    ],
    clips,
    playthroughs: [
      'fresh-save intended route',
      'returning-save revisit route',
      'collectible and optional-branch route',
      'credible speedrun route',
      'two-player route and transition',
    ],
  };
}

async function compareMirror(publicRoot, mirrorRoot, filenames) {
  const records = [];
  for (const filename of filenames) {
    try {
      const [source, mirror] = await Promise.all([
        readFile(resolve(publicRoot, filename)),
        readFile(resolve(mirrorRoot, filename)),
      ]);
      records.push({
        filename,
        sourceSha256: digest(source),
        mirrorSha256: digest(mirror),
        identical: source.equals(mirror),
      });
    } catch (error) {
      records.push({
        filename,
        identical: false,
        error: error && error.code ? error.code : String(error),
      });
    }
  }
  return {
    ok: records.every((record) => record.identical),
    checked: records.length,
    files: records,
  };
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function fileExists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

export async function buildBaseline(root = ROOT) {
  const publicRoot = resolve(root, 'public');
  const mirrorRoot = resolve(root, 'netlify-deploy');
  const [index, serviceWorker, authoringSource] = await Promise.all([
    readFile(resolve(publicRoot, 'index.html'), 'utf8'),
    readFile(resolve(publicRoot, 'sw.js'), 'utf8'),
    readFile(resolve(publicRoot, 'bladefall-authoring.js'), 'utf8'),
  ]);
  const version = index.match(/const VERSION='([^']+)'/)?.[1] || null;
  const cache = serviceWorker.match(/const CACHE_NAME = '([^']+)'/)?.[1] || null;
  const linkedScripts = [...index.matchAll(/<script[^>]+src="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((filename) => !/^https?:/.test(filename));
  const parityFiles = [...new Set([
    'index.html',
    'sw.js',
    'manifest.webmanifest',
    ...linkedScripts,
  ])].sort();
  const mirrorParity = await compareMirror(publicRoot, mirrorRoot, parityFiles);

  const blueprints = Campaign.blueprints;
  const stages = blueprints.map((blueprint) => {
    const manifest = Campaign.authoringManifest(blueprint.index);
    return {
      index: blueprint.index,
      id: blueprint.id,
      name: blueprint.stage.name,
      source: blueprint.source,
      length: blueprint.stage.len,
      theme: blueprint.stage.theme,
      type: blueprint.stage.type,
      boss: blueprint.stage.boss || null,
      secret: !!blueprint.stage.secret,
      signature: blueprint.signature,
      systems: [...blueprint.systems],
      acts: [...blueprint.acts],
      portalVerb: blueprint.portalVerb,
      composition: blueprint.composition,
      blueprintManifestCounts: {
        objects: manifest.objects.length,
        enemies: manifest.enemies.length,
        pickups: manifest.pickups.length,
        travelers: manifest.travelers.length,
      },
      evidence: capturePlan(blueprint),
    };
  });
  const visualAtlas = await readOptionalJson(
    resolve(root, 'docs/baseline/evidence/a1-visual-atlas.json'),
  );
  const visualAtlasComplete = !!(visualAtlas
    && visualAtlas.schema === 'bladefall.a1-visual-atlas'
    && visualAtlas.gameVersion === A1_CAPTURE_VERSION
    && visualAtlas.capturedStages === stages.length
    && visualAtlas.capturedStills >= stages.length * 3
    && Array.isArray(visualAtlas.pageErrors)
    && visualAtlas.pageErrors.length === 0);
  const visualReviewComplete = await fileExists(
    resolve(root, 'docs/baseline/a1-visual-review.md'),
  );
  const interactiveBaseline = await readOptionalJson(
    resolve(root, 'docs/baseline/interactive/a1-interactive-baseline.json'),
  );
  const entranceProbeComplete = !!(interactiveBaseline
    && interactiveBaseline.schema === 'bladefall.a1-interactive-baseline'
    && interactiveBaseline.gameVersion === A1_CAPTURE_VERSION
    && interactiveBaseline.capturedStages === stages.length
    && interactiveBaseline.coverage?.entranceLocomotion === 'complete'
    && Array.isArray(interactiveBaseline.pageErrors)
    && interactiveBaseline.pageErrors.length === 0);
  const dynamicBaseline = await readOptionalJson(
    resolve(root, 'docs/baseline/dynamics/a1-dynamic-baseline.json'),
  );
  const targetedDynamicProbeSetComplete = !!(dynamicBaseline
    && dynamicBaseline.schema === 'bladefall.a1-dynamic-baseline'
    && dynamicBaseline.gameVersion === A1_CAPTURE_VERSION
    && dynamicBaseline.capturedProbes >= 8
    && Array.isArray(dynamicBaseline.pageErrors)
    && dynamicBaseline.pageErrors.length === 0);
  const bossBaseline = await readOptionalJson(
    resolve(root, 'docs/baseline/bosses/a1-boss-baseline.json'),
  );
  const targetedBossProbeSetComplete = !!(bossBaseline
    && bossBaseline.schema === 'bladefall.a1-boss-baseline'
    && bossBaseline.gameVersion === A1_CAPTURE_VERSION
    && bossBaseline.capturedBosses === 7
    && Array.isArray(bossBaseline.pageErrors)
    && bossBaseline.pageErrors.length === 0);
  const openingRouteBaseline = await readOptionalJson(
    resolve(root, 'docs/baseline/routes/opening/a1-opening-route-baseline.json'),
  );
  const openingRouteAttemptSetComplete = !!(openingRouteBaseline
    && openingRouteBaseline.schema === 'bladefall.a1-opening-route-baseline'
    && openingRouteBaseline.gameVersion === A1_CAPTURE_VERSION
    && openingRouteBaseline.capturedStages === 4
    && Array.isArray(openingRouteBaseline.pageErrors)
    && openingRouteBaseline.pageErrors.length === 0);

  const mutationPasses = [
    'applyCampaignCadence',
    'applyPortalComposition',
    'applyFollowerUtility',
    'applyMasteryBalance',
    'applyCampaignBlueprint',
    'applyKeepActRemaster',
    'applyElementalActRemaster',
    'applyFinaleActRemaster',
    'applyPeopleAndPlace',
    'applyNgRemix',
    'dressEnvironmentalMechanisms',
    'dressFluidShowcase',
  ].map((name) => ({
    name,
    references: countMatches(index, new RegExp(`\\b${name}\\s*\\(`, 'g')),
  }));

  const risks = [
    {
      id: 'fluid-showcase-surface-placement',
      severity: 'high',
      detected: /function dressFluidShowcase\(\)[\s\S]*?Fluid\(x,\s*320,\s*0,\s*22,\s*'water'/.test(index),
      affectedStages: ['updrafts'],
      evidence: 'dressFluidShowcase places a water volume at y=0 on selected existing ground without authored basin walls.',
      gate: 'No fluid may ship until containment, source, shore, collision, and exit checks pass.',
    },
    {
      id: 'automatic-environment-composition',
      severity: 'high',
      detected: /plan\.recipe==='current-updraft'[\s\S]*?Fluid\(fx,[\s\S]*?pl\.y/.test(index),
      affectedStages: stages
        .filter((stage) => stage.composition.recipe !== 'none')
        .map((stage) => stage.id),
      evidence: 'Campaign recipes search for generic safe footing and add gameplay geometry after initial assembly.',
      gate: 'Base-campaign geometry must be explicitly owned by a room manifest.',
    },
    {
      id: 'detached-blueprint-geometry',
      severity: 'high',
      detected: stages.every((stage) =>
        Object.values(stage.blueprintManifestCounts).every((count) => count === 0)),
      affectedStages: stages.map((stage) => stage.id),
      evidence: 'Blueprint authoring manifests describe intent but contain no assembled runtime geometry.',
      gate: 'A level cannot pass planning until its runtime capture and room map are attached.',
    },
    {
      id: 'dynamic-route-proof-gap',
      severity: 'high',
      detected: /softlock\.exit\.unproven/.test(authoringSource)
        && !/object\.type\s*===\s*'fluid'/.test(
          authoringSource.slice(
            authoringSource.indexOf('function analyzeSoftlocks'),
            authoringSource.indexOf('function encounterRole'),
          )),
      affectedStages: stages
        .filter((stage) => stage.systems.some((system) =>
          /portal|moving|wind|updraft|water|lava|gravity|minecart|collapsing/.test(system)))
        .map((stage) => stage.id),
      evidence: 'Static reachability reports dynamic paths as unknown and does not model fluid as a traversal dependency.',
      gate: 'Dynamic rooms require recorded successful, failed, reset, and co-op traversals.',
    },
    {
      id: 'late-stage-mutation-stack',
      severity: 'medium',
      detected: mutationPasses.filter((pass) => pass.references > 1).length >= 6,
      affectedStages: stages.map((stage) => stage.id),
      evidence: 'Multiple late passes can change a level after its custom/procedural geometry is assembled.',
      gate: 'Every final object must report its owning room and authoring pass.',
    },
    {
      id: 'visual-capture-incomplete',
      severity: 'blocking',
      detected: !visualAtlasComplete,
      affectedStages: visualAtlasComplete ? [] : stages.map((stage) => stage.id),
      evidence: visualAtlasComplete
        ? `${visualAtlas.capturedStills} version-matched stills cover all ${visualAtlas.capturedStages} stages.`
        : 'No complete, version-matched static screenshot atlas currently accompanies the campaign baseline.',
      gate: 'The static visual atlas must cover every stage without page errors.',
    },
    {
      id: 'interactive-evidence-incomplete',
      severity: 'blocking',
      detected: true,
      affectedStages: stages.map((stage) => stage.id),
      evidence: entranceProbeComplete && targetedDynamicProbeSetComplete
        && targetedBossProbeSetComplete && openingRouteAttemptSetComplete
        ? `${interactiveBaseline.capturedStages} version-matched entrance probes, ${dynamicBaseline.capturedProbes} disclosed mechanic probes, ${bossBaseline.capturedBosses} forced-phase/reset boss probes, and ${openingRouteBaseline.capturedStages} extended opening-route attempts are recorded; they do not prove human-readable dynamic resolution, legitimate boss victories, complete routes, speedrun routing, or co-op traversal.`
        : entranceProbeComplete && targetedDynamicProbeSetComplete && targetedBossProbeSetComplete
          ? `${interactiveBaseline.capturedStages} version-matched entrance probes, ${dynamicBaseline.capturedProbes} disclosed mechanic probes, and ${bossBaseline.capturedBosses} forced-phase/reset boss probes are recorded; they do not prove natural dynamic-room resolution, legitimate boss victories, complete routes, speedrun routing, or co-op traversal.`
        : entranceProbeComplete && targetedDynamicProbeSetComplete
          ? `${interactiveBaseline.capturedStages} version-matched entrance probes and ${dynamicBaseline.capturedProbes} disclosed targeted mechanic probes are recorded; they do not prove natural dynamic-room resolution, complete routes, bosses, speedrun routing, or co-op traversal.`
        : entranceProbeComplete
          ? `${interactiveBaseline.capturedStages} version-matched, input-only entrance probes are recorded; they do not prove dynamic resolution, complete routes, speedrun routing, or co-op traversal.`
        : 'Camera-positioned stills and runtime captures do not prove dynamic resolution, reset safety, ordinary completion, speedrun routing, or co-op traversal.',
      gate: 'A1 remains open until dynamic recordings and the five route reviews are complete.',
    },
  ];

  return {
    schema: 'bladefall.a1-structural-baseline',
    version: 1,
    game: {
      version,
      serviceWorkerCache: cache,
      stageCount: stages.length,
    },
    baseline: {
      captureVersion: A1_CAPTURE_VERSION,
      currentVersion: version,
      currentVersionMatched: version === A1_CAPTURE_VERSION,
      scope: 'archived-pre-reimagining',
    },
    ownership: {
      canonicalSource: 'public',
      generatedMirror: 'netlify-deploy',
      mirrorParity,
      stageSources: sourceCounts(blueprints),
      lateMutationPasses: mutationPasses,
    },
    testContract: {
      structuralCommand: 'npm test',
      releaseCommand: 'npm run release:check',
      baselineCommand: 'npm run baseline:audit',
      warning: 'Passing automated tests do not satisfy the visual or experiential gate.',
    },
    stages,
    risks,
    visualEvidence: visualAtlasComplete ? {
      schema: visualAtlas.schema,
      gameVersion: visualAtlas.gameVersion,
      scope: 'archived-pre-reimagining',
      currentVersionMatched: visualAtlas.gameVersion === version,
      url: visualAtlas.url,
      capturedStages: visualAtlas.capturedStages,
      capturedStills: visualAtlas.capturedStills,
      pageErrors: visualAtlas.pageErrors.length,
    } : null,
    interactiveEvidence: entranceProbeComplete ? {
      schema: interactiveBaseline.schema,
      gameVersion: interactiveBaseline.gameVersion,
      scope: 'archived-pre-reimagining',
      currentVersionMatched: interactiveBaseline.gameVersion === version,
      url: interactiveBaseline.url,
      capturedStages: interactiveBaseline.capturedStages,
      routeClass: interactiveBaseline.routeClass,
      coverage: interactiveBaseline.coverage,
      pageErrors: interactiveBaseline.pageErrors.length,
    } : null,
    dynamicEvidence: targetedDynamicProbeSetComplete ? {
      schema: dynamicBaseline.schema,
      gameVersion: dynamicBaseline.gameVersion,
      scope: 'archived-pre-reimagining',
      currentVersionMatched: dynamicBaseline.gameVersion === version,
      url: dynamicBaseline.url,
      capturedProbes: dynamicBaseline.capturedProbes,
      coverage: dynamicBaseline.coverage,
      pageErrors: dynamicBaseline.pageErrors.length,
    } : null,
    bossEvidence: targetedBossProbeSetComplete ? {
      schema: bossBaseline.schema,
      gameVersion: bossBaseline.gameVersion,
      scope: 'archived-pre-reimagining',
      currentVersionMatched: bossBaseline.gameVersion === version,
      url: bossBaseline.url,
      capturedBosses: bossBaseline.capturedBosses,
      coverage: bossBaseline.coverage,
      pageErrors: bossBaseline.pageErrors.length,
    } : null,
    openingRouteEvidence: openingRouteAttemptSetComplete ? {
      schema: openingRouteBaseline.schema,
      gameVersion: openingRouteBaseline.gameVersion,
      scope: 'archived-pre-reimagining',
      currentVersionMatched: openingRouteBaseline.gameVersion === version,
      url: openingRouteBaseline.url,
      capturedStages: openingRouteBaseline.capturedStages,
      routeClass: openingRouteBaseline.routeClass,
      coverage: openingRouteBaseline.coverage,
      pageErrors: openingRouteBaseline.pageErrors.length,
    } : null,
    completion: {
      structuralInventory: 'complete',
      mirrorParity: mirrorParity.ok ? 'complete' : 'failed',
      visualAtlas: visualAtlasComplete ? 'complete' : 'pending',
      entranceLocomotionProbes: entranceProbeComplete ? 'complete' : 'pending',
      targetedDynamicProbeSet: targetedDynamicProbeSetComplete ? 'complete' : 'pending',
      targetedBossResetProbes: targetedBossProbeSetComplete ? 'complete' : 'pending',
      openingRouteAttemptSet: openingRouteAttemptSetComplete ? 'complete' : 'pending',
      dynamicRoomRecordings: entranceProbeComplete || targetedDynamicProbeSetComplete ? 'partial' : 'pending',
      bossRecordings: targetedBossProbeSetComplete ? 'partial' : 'pending',
      naturalBossVictories: 'pending',
      humanRouteReviews: 'pending',
      humanDesignReview: visualReviewComplete ? 'complete' : 'pending',
      a1Status: 'open',
    },
  };
}

async function main() {
  const report = await buildBaseline();
  if (process.argv.includes('--write')) {
    const outputFlag = process.argv.indexOf('--output');
    const output = outputFlag >= 0 && process.argv[outputFlag + 1]
      ? resolve(process.cwd(), process.argv[outputFlag + 1])
      : DEFAULT_OUTPUT;
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: report.ownership.mirrorParity.ok,
      output,
      stages: report.stages.length,
      detectedRisks: report.risks.filter((risk) => risk.detected).length,
      a1Status: report.completion.a1Status,
    }, null, 2));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  await main();
}
