import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const allowedExtensions = new Set([
  '.ts',
  '.js',
  '.json',
  '.md',
  '.yml',
  '.yaml',
]);
const ignoredDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  'build',
]);

const mojibakePattern = /(?:[РС][\u0400-\u045f]|в[\u0400-\u045f]){2,}/u;
const replacementCharPattern = /\uFFFD/u;

const failures = [];

walk(rootDir);

if (failures.length > 0) {
  console.error('Text corruption check failed.\n');
  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} ${failure.reason}`);
    console.error(`  ${failure.preview}`);
  }
  process.exit(1);
}

console.log('Text corruption check passed.');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
      continue;
    }

    const ext = path.extname(entry.name);
    if (!allowedExtensions.has(ext)) {
      continue;
    }

    checkFile(path.join(dir, entry.name));
  }
}

function checkFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString('utf8');
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (replacementCharPattern.test(line)) {
      failures.push({
        file: relativePath(filePath),
        line: index + 1,
        reason: 'contains Unicode replacement character',
        preview: sanitize(line),
      });
      continue;
    }

    if (mojibakePattern.test(line)) {
      failures.push({
        file: relativePath(filePath),
        line: index + 1,
        reason: 'looks like mojibake / encoding corruption',
        preview: sanitize(line),
      });
    }
  }
}

function relativePath(filePath) {
  return path.relative(rootDir, filePath).replaceAll('\\', '/');
}

function sanitize(line) {
  const trimmed = line.trim();
  if (trimmed.length <= 140) {
    return trimmed;
  }
  return `${trimmed.slice(0, 137)}...`;
}
