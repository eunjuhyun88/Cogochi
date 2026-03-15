#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  autoresearchDir,
  parseArgs,
  readLatest,
  writeJson,
  writeReport,
} from './lib.mjs';

const options = parseArgs();
const minImprovement = Number(options.minImprovement ?? '0.01');
const scoreReport = readLatest('score');

if (!scoreReport) {
  console.error('[autoresearch:accept] missing score.latest.json. Run `npm run autoresearch:score` first.');
  process.exit(1);
}

const baselinePath = path.join(autoresearchDir(), 'baseline.json');
const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  : null;

let decision;

if (options.setBaseline || !baseline) {
  const nextBaseline = {
    capturedAt: new Date().toISOString(),
    totalScore: scoreReport.totalScore,
    hardGatePass: scoreReport.hardGatePass,
  };
  writeJson(baselinePath, nextBaseline);
  decision = {
    type: 'decision',
    status: 'baseline-set',
    accepted: true,
    checkedAt: new Date().toISOString(),
    currentScore: scoreReport.totalScore,
    baselineScore: nextBaseline.totalScore,
    improvement: 0,
    minImprovement,
  };
} else {
  const improvement = Number((scoreReport.totalScore - baseline.totalScore).toFixed(3));
  const accepted = scoreReport.hardGatePass && improvement >= minImprovement;

  if (accepted) {
    writeJson(baselinePath, {
      capturedAt: new Date().toISOString(),
      totalScore: scoreReport.totalScore,
      hardGatePass: scoreReport.hardGatePass,
    });
  }

  decision = {
    type: 'decision',
    status: accepted ? 'accept' : 'reject',
    accepted,
    checkedAt: new Date().toISOString(),
    currentScore: scoreReport.totalScore,
    baselineScore: baseline.totalScore,
    improvement,
    minImprovement,
    reason: accepted
      ? 'The branch cleared the hard gates and improved the weighted score.'
      : scoreReport.hardGatePass
        ? 'The branch did not improve the score enough to beat baseline.'
        : 'One or more hard gates failed.',
  };
}

const paths = writeReport('decision', decision);
console.log(JSON.stringify({
  status: decision.status,
  accepted: decision.accepted,
  currentScore: decision.currentScore,
  baselineScore: decision.baselineScore,
  improvement: decision.improvement,
  latestReport: paths.latestPath,
}, null, 2));
