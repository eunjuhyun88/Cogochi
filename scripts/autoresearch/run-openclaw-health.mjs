#!/usr/bin/env node
import {
  parseArgs,
  statusFromScore,
  writeReport,
} from './lib.mjs';

const options = parseArgs();
const requestedModel =
  options.model ||
  process.env.OPENCLAW_MODEL ||
  process.env.OPENAI_MODEL ||
  '';

const candidateBases = [
  options.baseUrl,
  process.env.OPENCLAW_BASE_URL,
  process.env.OPENAI_BASE_URL,
  'http://127.0.0.1:11434',
  'http://127.0.0.1:11434/v1',
  'http://localhost:11434',
  'http://localhost:11434/v1',
].filter(Boolean);

const uniqueBases = [...new Set(candidateBases)];

async function probe(baseUrl) {
  const endpoints = [
    { kind: 'openai', url: `${baseUrl.replace(/\/$/, '')}/v1/models` },
    { kind: 'openai', url: `${baseUrl.replace(/\/$/, '')}/models` },
    { kind: 'ollama', url: `${baseUrl.replace(/\/$/, '')}/api/tags` },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      if (!response.ok) {
        continue;
      }
      const body = await response.json();
      const models = endpoint.kind === 'ollama'
        ? (body.models ?? []).map((item) => item.name).filter(Boolean)
        : (body.data ?? []).map((item) => item.id).filter(Boolean);
      return {
        ok: true,
        baseUrl,
        endpoint: endpoint.url,
        kind: endpoint.kind,
        models,
      };
    } catch (error) {
      // Keep probing alternate endpoints.
    }
  }

  return {
    ok: false,
    baseUrl,
    endpoint: null,
    kind: null,
    models: [],
  };
}

const probes = await Promise.all(uniqueBases.map((baseUrl) => probe(baseUrl)));
const firstSuccess = probes.find((result) => result.ok) ?? null;
const modelFound = requestedModel
  ? Boolean(firstSuccess?.models.some((modelId) => modelId.includes(requestedModel)))
  : Boolean(firstSuccess);

const readinessScore = firstSuccess ? (modelFound ? 1 : 0.7) : 0;
const status = firstSuccess
  ? (modelFound ? 'ready' : 'partial')
  : statusFromScore(readinessScore);

const report = {
  type: 'openclaw-health',
  status,
  score: readinessScore,
  requestedModel,
  checkedAt: new Date().toISOString(),
  notes: firstSuccess
    ? [
        'A local compatible runtime responded to model discovery.',
        requestedModel && !modelFound ? 'The endpoint responded, but the requested model was not visible.' : 'The runtime can be used for the next integration step.',
      ]
    : [
        'No local OpenClaw-compatible endpoint responded.',
        'This does not block deterministic fallback work, but it does block validating the OpenClaw runtime path.',
      ],
  probes,
};

const paths = writeReport('openclaw-health', report);
console.log(JSON.stringify({
  status: report.status,
  score: report.score,
  latestReport: paths.latestPath,
  requestedModel: report.requestedModel,
}, null, 2));
