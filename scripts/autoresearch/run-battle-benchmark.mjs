#!/usr/bin/env node
import {
  exists,
  listFilesRecursive,
  readText,
  scoreFromChecks,
  statusFromScore,
  writeReport,
} from './lib.mjs';

const engineFiles = listFilesRecursive('src/lib/engine').filter((filePath) => !filePath.endsWith('/CLAUDE.md') && !filePath.endsWith('CLAUDE.md'));
const agentSystemDoc = readText('docs/AGENT_SYSTEM_DESIGN.md');
const battlefieldDoc = readText('docs/BATTLEFIELD_DESIGN.md');
const previewScript = readText('static/dino-raising-preview/app.js');

const checks = [
  {
    label: 'program contract exists',
    passed: exists('program.md'),
  },
  {
    label: 'founder goal exists',
    passed: exists('docs/exec-plans/active/COGOCHI_founder_goal_20260312.md'),
  },
  {
    label: 'agent system defines evaluation loop',
    passed: agentSystemDoc.includes('EvalScenario') && agentSystemDoc.includes('EvalMatch'),
  },
  {
    label: 'battlefield design doc exists',
    passed: battlefieldDoc.length > 0,
  },
  {
    label: 'determinism is documented',
    passed: agentSystemDoc.toLowerCase().includes('deterministic') || battlefieldDoc.toLowerCase().includes('deterministic'),
  },
  {
    label: 'engine implementation exists beyond placeholders',
    passed: engineFiles.length > 0,
  },
  {
    label: 'current prototype exposes cause and effect language',
    passed: previewScript.includes('battleProjection') && previewScript.includes('memoryProjection') && previewScript.includes('scenarioProjection'),
  },
];

const readinessScore = scoreFromChecks(checks);
const status = engineFiles.length > 0 ? statusFromScore(readinessScore) : 'blocked';

const report = {
  type: 'battle-benchmark',
  mode: 'readiness',
  status,
  score: readinessScore,
  checkedAt: new Date().toISOString(),
  checks,
  notes: engineFiles.length > 0
    ? [
        'Battle evaluation has enough structural pieces to start real scenario benchmarking.',
      ]
    : [
        'No executable battle engine files exist yet beyond placeholders.',
        'This report currently measures battle-loop readiness, not live scenario performance.',
      ],
};

const paths = writeReport('battle-benchmark', report);
console.log(JSON.stringify({
  status: report.status,
  score: report.score,
  latestReport: paths.latestPath,
}, null, 2));
