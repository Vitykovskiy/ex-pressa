import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const messagePath = process.argv[2];

if (!messagePath) {
  process.exit(0);
}

const version = readFileSync(join(process.cwd(), '.app-version'), 'utf8').trim();

if (!version) {
  process.exit(0);
}

const current = readFileSync(messagePath, 'utf8');
if (/^Version:\s+/m.test(current)) {
  process.exit(0);
}

const trimmed = current.replace(/\s+$/, '');
writeFileSync(messagePath, `${trimmed}\n\nVersion: ${version}\n`, 'utf8');
