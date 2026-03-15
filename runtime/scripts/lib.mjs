#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const runtimeDir = path.resolve(scriptsDir, '..');
export const rootDir = path.resolve(runtimeDir, '..');

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

export function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  } catch {
    return '';
  }
}

export function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

export function writeText(relativePath, text) {
  const filePath = path.join(rootDir, relativePath);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text);
}

export function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function readConfig() {
  return readJson('runtime/runtime-config.json');
}

export function sourceEntries(entries) {
  return entries.filter((entry) => exists(entry.path)).map((entry) => ({
    ...entry,
    text: readText(entry.path),
  }));
}

export function markdownSections(text) {
  const lines = text.split('\n');
  const sections = [];
  let currentHeading = 'Overview';
  let buffer = [];

  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line)) {
      if (buffer.join('').trim()) {
        sections.push({
          heading: currentHeading,
          body: buffer.join('\n').trim(),
        });
      }
      currentHeading = line.replace(/^#{1,3}\s+/, '').trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }

  if (buffer.join('').trim()) {
    sections.push({
      heading: currentHeading,
      body: buffer.join('\n').trim(),
    });
  }

  return sections;
}
