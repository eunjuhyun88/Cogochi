#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const rootDir = process.cwd();

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }
    const key = current.slice(2).replace(/-([a-z])/g, (_, value) => value.toUpperCase());
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }
  return options;
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

export function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  } catch {
    return '';
  }
}

export function listFilesRecursive(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return [];
  }
  const results = [];
  const visit = (currentPath) => {
    const stat = fs.statSync(currentPath);
    if (stat.isFile()) {
      results.push(path.relative(rootDir, currentPath));
      return;
    }
    for (const entry of fs.readdirSync(currentPath)) {
      visit(path.join(currentPath, entry));
    }
  };
  visit(absolutePath);
  return results;
}

export function scoreFromChecks(checks) {
  if (!checks.length) {
    return 0;
  }
  const passed = checks.filter((check) => check.passed).length;
  return Number((passed / checks.length).toFixed(3));
}

export function normalizeScore(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}

export function statusFromScore(score, thresholds = { ready: 0.8, partial: 0.45 }) {
  if (score >= thresholds.ready) {
    return 'ready';
  }
  if (score >= thresholds.partial) {
    return 'partial';
  }
  return 'blocked';
}

export function autoresearchDir() {
  const dirPath = path.join(rootDir, '.agent-context', 'autoresearch');
  ensureDir(dirPath);
  return dirPath;
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeReport(name, report) {
  const dirPath = autoresearchDir();
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const latestPath = path.join(dirPath, `${name}.latest.json`);
  const stampedPath = path.join(dirPath, `${name}.${timestamp}.json`);
  writeJson(latestPath, report);
  writeJson(stampedPath, report);
  return { latestPath, stampedPath };
}

export function readLatest(name) {
  const latestPath = path.join(autoresearchDir(), `${name}.latest.json`);
  if (!fs.existsSync(latestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
}

export function shellStatus(command) {
  try {
    execSync(command, {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { ok: true, command, error: '' };
  } catch (error) {
    const stderr = typeof error.stderr === 'string' ? error.stderr.trim() : '';
    const stdout = typeof error.stdout === 'string' ? error.stdout.trim() : '';
    return {
      ok: false,
      command,
      error: stderr || stdout || String(error.message ?? error),
    };
  }
}
