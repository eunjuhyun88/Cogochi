import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { getProofPack } from '$lib/engine/proof-system';

const rootDir = process.cwd();
const passportDir = path.join(rootDir, 'runtime/generated/passports');
const registryPath = path.join(passportDir, 'index.json');

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function snapshotPath(slug) {
  return path.join(passportDir, `${slug}.json`);
}

function emptyRegistry() {
  return {
    version: 1,
    entries: [],
  };
}

async function readRegistry() {
  try {
    const raw = await fs.readFile(registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.entries) ? parsed : emptyRegistry();
  } catch {
    return emptyRegistry();
  }
}

async function writeRegistry(registry) {
  await fs.mkdir(passportDir, { recursive: true });
  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
}

function makeShareToken() {
  return crypto.randomBytes(18).toString('hex');
}

function sanitizePublicArtifact(artifact) {
  const pack = getProofPack(artifact.proofPackId);
  if (!pack?.publicReady) {
    return null;
  }

  return {
    ...artifact,
    criteriaSummary: artifact.criteriaSummary.slice(0, 6),
    proofPackTitle: pack.title,
    proofMode: pack.mode,
  };
}

export async function writePassportSnapshot(input) {
  const publicArtifacts = input.publicArtifacts
    .map(sanitizePublicArtifact)
    .filter(Boolean)
    .sort((a, b) => b.createdAt - a.createdAt);

  const slug = normalizeSlug(input.agentId || input.agentName || 'passport');
  const registry = await readRegistry();
  const existingEntry = registry.entries.find((entry) => entry.slug === slug) ?? null;
  const exportedAt = new Date().toISOString();
  const snapshot = {
    ...input,
    publicArtifacts,
    slug,
    exportedAt,
    acceptedPublicArtifacts: publicArtifacts.filter((artifact) => artifact.trainerVerdict === 'ACCEPTED').length,
    latestPublicArtifact: publicArtifacts[0] ?? null,
    publishStatus: existingEntry?.publishStatus ?? 'DRAFT',
    publishedAt: existingEntry?.publishedAt ?? null,
  };

  await fs.mkdir(passportDir, { recursive: true });
  await fs.writeFile(snapshotPath(slug), JSON.stringify(snapshot, null, 2));
  const nextEntry = {
    slug,
    agentId: input.agentId,
    agentName: input.agentName,
    publishStatus: snapshot.publishStatus,
    shareToken: existingEntry?.shareToken ?? makeShareToken(),
    exportedAt,
    publishedAt: snapshot.publishedAt,
    updatedAt: exportedAt,
  };
  registry.entries = [...registry.entries.filter((entry) => entry.slug !== slug), nextEntry];
  await writeRegistry(registry);
  return snapshot;
}

export async function readPassportSnapshot(slug) {
  try {
    const raw = await fs.readFile(snapshotPath(normalizeSlug(slug)), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function readPassportRecord(slug) {
  const normalizedSlug = normalizeSlug(slug);
  const [snapshot, registry] = await Promise.all([readPassportSnapshot(normalizedSlug), readRegistry()]);
  if (!snapshot) {
    return null;
  }

  const entry = registry.entries.find((candidate) => candidate.slug === normalizedSlug) ?? null;
  return {
    snapshot,
    entry,
  };
}

export async function publishPassportSnapshot(slug) {
  const normalizedSlug = normalizeSlug(slug);
  const registry = await readRegistry();
  const entry = registry.entries.find((candidate) => candidate.slug === normalizedSlug) ?? null;
  const snapshot = await readPassportSnapshot(normalizedSlug);

  if (!entry || !snapshot) {
    return null;
  }

  const publishedAt = entry.publishedAt ?? new Date().toISOString();
  const updatedEntry = {
    ...entry,
    publishStatus: 'PUBLISHED',
    publishedAt,
    updatedAt: new Date().toISOString(),
  };
  const updatedSnapshot = {
    ...snapshot,
    publishStatus: 'PUBLISHED',
    publishedAt,
  };

  registry.entries = [...registry.entries.filter((candidate) => candidate.slug !== normalizedSlug), updatedEntry];
  await writeRegistry(registry);
  await fs.writeFile(snapshotPath(normalizedSlug), JSON.stringify(updatedSnapshot, null, 2));

  return {
    snapshot: updatedSnapshot,
    entry: updatedEntry,
  };
}

export async function readPublishedPassportByToken(token) {
  const registry = await readRegistry();
  const entry = registry.entries.find((candidate) => candidate.shareToken === token && candidate.publishStatus === 'PUBLISHED') ?? null;
  if (!entry) {
    return null;
  }

  const snapshot = await readPassportSnapshot(entry.slug);
  if (!snapshot) {
    return null;
  }

  return {
    snapshot,
    entry,
  };
}
