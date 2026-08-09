import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.pnpm-store',
  '.venv',
  'node_modules',
  'dist',
  'coverage',
]);

const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bsk-proj-[A-Za-z0-9_-]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
];

async function* walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.isFile()) {
      yield path;
    }
  }
}

const findings = [];
for await (const path of walk(root)) {
  const name = relative(root, path);
  if (name === 'scripts/check-no-secrets.mjs') continue;
  if (/\.env(?:\.|$)/.test(name) && !name.endsWith('.env.example')) {
    findings.push(`${name}: environment file must not be committed`);
    continue;
  }

  let content;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    continue;
  }

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      findings.push(`${name}: matched secret pattern ${pattern}`);
    }
  }
}

if (findings.length > 0) {
  console.error(`Potential secrets detected:\n${findings.map((f) => `- ${f}`).join('\n')}`);
  process.exit(1);
}

console.log('No configured secret patterns detected.');
