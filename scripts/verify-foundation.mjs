import { access } from 'node:fs/promises';
import { constants } from 'node:fs';

const requiredFiles = [
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  '.editorconfig',
  'apps/web/package.json',
  'apps/api/pyproject.toml',
  'packages/domain/package.json',
];

const missing = [];
for (const path of requiredFiles) {
  try {
    await access(path, constants.F_OK);
  } catch {
    missing.push(path);
  }
}

if (missing.length > 0) {
  console.error(`Repository foundation is incomplete:\n${missing.map((p) => `- ${p}`).join('\n')}`);
  process.exit(1);
}

console.log('Repository foundation files are present.');
