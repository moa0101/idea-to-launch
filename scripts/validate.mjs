#!/usr/bin/env node
// Checks the pack the way a user would trip over it. Runs locally (`node scripts/validate.mjs`) and in CI.
// No dependencies. Checks tracked files only (git ls-files), so build output and node_modules never count.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const tracked = execSync('git ls-files -z', { encoding: 'utf8' }).split('\0').filter(Boolean).filter((f) => existsSync(f));
const text = (f) => readFileSync(f, 'utf8');
const TEXT_EXT = /\.(md|json|mjs|js|ts|tsx|html|css|sql|sh|ya?ml|txt|svg)$/i;

// 1. Skills: header present, name matches the folder, description usable.
const skills = readdirSync('skills', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const name of skills) {
  const f = `skills/${name}/SKILL.md`;
  if (!existsSync(f)) { fail(f, 'missing'); continue; }
  const m = text(f).match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) { fail(f, 'no YAML header'); continue; }
  const head = m[1];
  const n = head.match(/^name:\s*(.+)$/m)?.[1].trim();
  if (n !== name) fail(f, `name "${n}" must equal the folder name "${name}"`);
  if (!/^[a-z0-9-]{1,64}$/.test(n ?? '')) fail(f, 'name must be lowercase letters, digits and hyphens (≤ 64)');
  const d = head.match(/^description:\s*(?:>-?|\|-?)?\s*\n?([\s\S]*?)(?=^\S|$(?![\s\S]))/m)?.[1].replace(/\s+/g, ' ').trim() ?? '';
  if (d.length < 40) fail(f, 'description is missing or too short to trigger the skill');
  if (d.length > 1024) fail(f, `description is ${d.length} chars (limit 1024)`);
}

// 2. Versions agree: plugin.json, marketplace entry, README badge, top of CHANGELOG.
const version = JSON.parse(text('.claude-plugin/plugin.json')).version;
const market = JSON.parse(text('.claude-plugin/marketplace.json')).plugins?.[0]?.version;
if (market && market !== version) fail('.claude-plugin/marketplace.json', `version ${market} ≠ plugin.json ${version}`);
const badge = text('README.md').match(/badge\/version-([\d.]+)-/)?.[1];
if (badge !== version) fail('README.md', `version badge ${badge} ≠ plugin.json ${version}`);
const log = existsSync('CHANGELOG.md') ? text('CHANGELOG.md').match(/^## ([\d.]+)/m)?.[1] : undefined;
if (log !== version) fail('CHANGELOG.md', `latest entry ${log} ≠ plugin.json ${version}`);

// 3. Every slash command in the README names a real skill.
for (const [, cmd] of text('README.md').matchAll(/(?<![\w/.-])\/(?:idea-to-launch:)?(launch[a-z-]*)(?![\w/.-])/g)) {
  if (!skills.includes(cmd)) fail('README.md', `command /${cmd} has no skill skills/${cmd}/`);
}

if (/(?<![\w/.:-])\/levelup\b/.test(text('README.md'))) fail('README.md', '/levelup is not a command; the skill is launch-levelup');

// 4. Relative links and images in Markdown resolve.
for (const f of tracked.filter((f) => f.endsWith('.md'))) {
  const body = text(f).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const links = [...body.matchAll(/\]\(([^)\s]+)\)/g), ...body.matchAll(/<img[^>]+src="([^"]+)"/g)].map((x) => x[1]);
  for (const href of links) {
    if (/^(https?:|mailto:|#|{{)/.test(href)) continue;
    const target = normalize(join(dirname(f), decodeURIComponent(href.split('#')[0])));
    if (!existsSync(target)) fail(f, `broken link → ${href}`);
  }
}

// 5. No machine-specific paths or secrets in anything we publish.
const SECRET = [/sb_secret_[A-Za-z0-9_-]{10,}/, /sk_live_[A-Za-z0-9]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/];
for (const f of tracked.filter((f) => TEXT_EXT.test(f) && !f.endsWith('package-lock.json') && f !== 'scripts/validate.mjs')) {
  const body = text(f);
  if (/(?:file:\/\/)?\/Users\/[A-Za-z0-9._-]+\/|[A-Z]:\\Users\\/.test(body)) fail(f, 'contains a local home-folder path');
  for (const re of SECRET) if (re.test(body)) fail(f, `looks like a secret (${re.source.slice(0, 18)}…)`);
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✔ ${skills.length} skills, v${version}, ${tracked.length} files checked`);
