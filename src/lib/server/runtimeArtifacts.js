import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const memoryIndexPath = path.join(rootDir, 'runtime/generated/memory-index.json');
const distillReportPath = path.join(rootDir, 'runtime/generated/nightly-distill-report.md');
const tierOrder = ['M0', 'M30', 'M90', 'M365'];

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function updatedAtFor(filePaths) {
  let latest = 0;

  for (const filePath of filePaths) {
    try {
      const stats = fs.statSync(filePath);
      latest = Math.max(latest, stats.mtimeMs);
    } catch {
      // ignore missing files
    }
  }

  return latest > 0 ? new Date(latest).toISOString() : null;
}

function emptyDistill() {
  return {
    goal: null,
    promotionRules: [],
    tierDigests: tierOrder.map((tier) => ({ tier, items: [] })),
    suggestedNextChecks: [],
  };
}

function parseDistillReport(markdown) {
  if (!markdown.trim()) {
    return emptyDistill();
  }

  const lines = markdown.split('\n');
  const digest = emptyDistill();
  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('Goal: ')) {
      digest.goal = line.replace('Goal: ', '').trim();
      continue;
    }

    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      continue;
    }

    if (!line.startsWith('- ')) {
      continue;
    }

    const item = line.replace('- ', '').trim();
    if (currentSection === 'Promotion Rules') {
      digest.promotionRules.push(item);
      continue;
    }
    if (currentSection === 'Suggested Next Checks') {
      digest.suggestedNextChecks.push(item);
      continue;
    }
    if (tierOrder.includes(currentSection)) {
      const tierDigest = digest.tierDigests.find((entry) => entry.tier === currentSection);
      tierDigest?.items.push(item);
    }
  }

  return digest;
}

export function readRuntimeArtifacts() {
  const memoryIndex = readJson(memoryIndexPath, { count: 0, entries: [] });
  const entries = (memoryIndex.entries ?? []).filter(
    (entry) => Boolean(entry?.id && entry?.heading && entry?.label && tierOrder.includes(entry.tierHint)),
  );
  const highlightedEntries = tierOrder.map((tier) => ({
    tier,
    entries: entries.filter((entry) => entry.tierHint === tier).slice(0, 4),
  }));

  const distill = parseDistillReport(readText(distillReportPath));
  const memoryIndexByTier = tierOrder.map((tier) => ({
    tier,
    items: entries
      .filter((entry) => entry.tierHint === tier)
      .slice(0, 6)
      .map((entry) => `${entry.label}: ${entry.heading}`),
  }));

  return {
    available: entries.length > 0 || Boolean(distill.goal),
    updatedAt: updatedAtFor([memoryIndexPath, distillReportPath]),
    memoryIndexCount: memoryIndex.count ?? entries.length,
    memoryIndexByTier,
    highlightedEntries,
    distill,
  };
}
