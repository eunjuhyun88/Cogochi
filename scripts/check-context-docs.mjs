import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'docs/INDEX.md',
  'docs/PROJECT_CONTEXT.md',
  'docs/PRODUCT_BLUEPRINT.md',
  'docs/AGENT_SYSTEM_DESIGN.md',
  'docs/AI_RUNTIME_TRAINING_SPEC.md',
  'docs/AI_IMPLEMENTATION_CONTRACTS.md',
  'docs/CONTEXT_ENGINEERING.md',
  'docs/PLANS.md',
  'docs/QUALITY_SCORE.md',
  'docs/RELIABILITY.md',
  'docs/exec-plans/README.md',
  'docs/exec-plans/tech-debt-tracker.md',
  'docs/exec-plans/active/.gitkeep',
  'docs/exec-plans/completed/.gitkeep'
];

const referenceRules = [
  {
    file: 'AGENTS.md',
    mustInclude: [
      'docs/INDEX.md',
      'docs/PROJECT_CONTEXT.md',
      'docs/AI_IMPLEMENTATION_CONTRACTS.md',
      'docs/RELIABILITY.md'
    ],
    maxLines: 160
  },
  {
    file: 'README.md',
    mustInclude: ['AGENTS.md', 'docs/INDEX.md']
  },
  {
    file: 'docs/INDEX.md',
    mustInclude: [
      'AGENT_SYSTEM_DESIGN.md',
      'AI_RUNTIME_TRAINING_SPEC.md',
      'AI_IMPLEMENTATION_CONTRACTS.md',
      'CONTEXT_ENGINEERING.md',
      'PLANS.md',
      'QUALITY_SCORE.md',
      'RELIABILITY.md',
      'exec-plans/active',
      'exec-plans/completed'
    ]
  },
  {
    file: 'docs/AI_RUNTIME_TRAINING_SPEC.md',
    mustInclude: ['AI_IMPLEMENTATION_CONTRACTS.md']
  }
];

const errors = [];

function readFile(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

for (const relPath of requiredPaths) {
  if (!fs.existsSync(path.join(root, relPath))) {
    errors.push(`Missing required context file: ${relPath}`);
  }
}

for (const rule of referenceRules) {
  if (!fs.existsSync(path.join(root, rule.file))) continue;

  const contents = readFile(rule.file);
  for (const token of rule.mustInclude ?? []) {
    if (!contents.includes(token)) {
      errors.push(`${rule.file} must reference "${token}"`);
    }
  }

  if (typeof rule.maxLines === 'number') {
    const lineCount = contents.split('\n').length;
    if (lineCount > rule.maxLines) {
      errors.push(`${rule.file} should stay concise (${lineCount} lines > ${rule.maxLines})`);
    }
  }
}

if (errors.length > 0) {
  console.error('Context docs check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Context docs check passed.');
