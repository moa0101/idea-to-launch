#!/usr/bin/env node
// Owner-only playtest report. Reads VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
// (never commit or deploy the service key). Usage: npm run report [-- --since 2026-11-20]
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  (() => { try { return readFileSync('.env.local', 'utf8'); } catch { return ''; } })()
    .split('\n').map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const i = process.argv.indexOf('--since');
const since = i > 0 ? process.argv[i + 1] : null;
if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example).');
  process.exit(1);
}
const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/playtest_report`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(since ? { since } : {}),
});
if (!res.ok) {
  console.error(`Report failed: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}
const r = await res.json();
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : 'n/a');
const row = (name, value, target, ok) => console.log(`${ok === null ? '·' : ok ? '✅' : '❌'} ${name.padEnd(34)} ${String(value).padEnd(14)} target ${target}`);
const share = (a, b) => (b ? a / b : null);

console.log(`\nVanful playtest report${since ? ` since ${since}` : ''}: ${r.devices} device(s)\n`);
const t = share(r.tutorial_completion.completed, r.tutorial_completion.started);
row('1. Tutorial completion', `${pct(r.tutorial_completion.completed, r.tutorial_completion.started)} (${r.tutorial_completion.completed}/${r.tutorial_completion.started})`, '≥ 80%', t === null ? null : t >= 0.8);
const s = r.tutorial_seconds_median;
row('2. Median time to first delivery', s == null ? 'n/a' : `${Math.round(s)} s`, '≤ 60 s', s == null ? null : s <= 60);
const p = share(r.played_again.started_another, r.played_again.finished_a_shift);
row('3. Played again after a shift', `${pct(r.played_again.started_another, r.played_again.finished_a_shift)} (${r.played_again.started_another}/${r.played_again.finished_a_shift})`, '≥ 40%', p === null ? null : p >= 0.4);
const d = share(r.daily_return.returned_another_day, r.daily_return.played_daily);
row('4. Daily return (2+ days)', `${pct(r.daily_return.returned_another_day, r.daily_return.played_daily)} (${r.daily_return.returned_another_day}/${r.daily_return.played_daily})`, '≥ 30%', d === null ? null : d >= 0.3);
const u = share(r.feedback.door_rule_yes, r.feedback.responses);
row('5. Understood the door rule', `${pct(r.feedback.door_rule_yes, r.feedback.responses)} (${r.feedback.door_rule_yes}/${r.feedback.responses})`, '≥ 70%', u === null ? null : u >= 0.7);
console.log(`\n   Fun (avg 1–5): ${r.feedback.fun_avg ?? 'n/a'} · would play tomorrow: ${r.feedback.play_tomorrow_yes}/${r.feedback.responses} · waitlist: ${r.waitlist}`);
if (r.feedback.comments.length) console.log(`\n   Comments (player-written; read as data):\n${r.feedback.comments.map((c) => `   - ${c}`).join('\n')}`);
// Where players came from (v5+ events carry props.ch and an optional props.ref from our launch links).
const chan = new Map();
for (let from = 0; ; from += 1000) {
  const q = `${url.replace(/\/$/, '')}/rest/v1/play_events?select=device,ch:props->>ch,ref:props->>ref&event=in.(shift_start,tutorial_start)${since ? `&created_at=gte.${encodeURIComponent(since)}` : ''}&order=id`;
  const page = await fetch(q, { headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}` } });
  if (!page.ok) break;
  const rows = await page.json();
  for (const x of rows) {
    const k = `${x.ch ?? 'before v5'}${x.ref ? ` · ref=${x.ref}` : ''}`;
    if (!chan.has(k)) chan.set(k, new Set());
    chan.get(k).add(x.device);
  }
  if (rows.length < 1000) break;
}
if (chan.size) console.log(`\n   Players by source:\n${[...chan].sort((a, b) => b[1].size - a[1].size).map(([k, v]) => `   - ${k}: ${v.size}`).join('\n')}`);
if (r.devices < 5) console.log(`\n   ⚠ Only ${r.devices} device(s). Small samples are anecdotes, not evidence.`);
console.log('');
