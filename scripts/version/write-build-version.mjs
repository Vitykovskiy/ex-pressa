import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const now = new Date();
const stamp = [
  now.getUTCFullYear(),
  String(now.getUTCMonth() + 1).padStart(2, '0'),
  String(now.getUTCDate()).padStart(2, '0'),
  '.',
  String(now.getUTCHours()).padStart(2, '0'),
  String(now.getUTCMinutes()).padStart(2, '0'),
  String(now.getUTCSeconds()).padStart(2, '0'),
].join('');

const version = `${pkg.version}+${stamp}`;
const generatedAt = now.toISOString();
const tsPath = join(root, 'src', 'generated', 'app-version.ts');
const stampPath = join(root, '.app-version');

mkdirSync(dirname(tsPath), { recursive: true });

writeFileSync(
  tsPath,
  `export const APP_VERSION = '${version}';
export const APP_VERSION_INFO = {
  appName: '${pkg.name}',
  packageVersion: '${pkg.version}',
  version: APP_VERSION,
  generatedAt: '${generatedAt}',
} as const;
`,
  'utf8',
);

writeFileSync(stampPath, `${version}\n`, 'utf8');

try {
  execFileSync('git', ['add', 'src/generated/app-version.ts', '.app-version'], {
    cwd: root,
    stdio: 'ignore',
  });
} catch {
  // Ignore hook staging issues outside git hook execution.
}
