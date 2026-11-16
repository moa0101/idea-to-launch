#!/usr/bin/env bash
# Builds one upload-ready zip per portal into release/: relative paths, index.html at the zip root.
# The public Supabase key from .env.local is included (insert-only by design); the service key never is (no VITE_ prefix).
set -euo pipefail
cd "$(dirname "$0")/.."
npx tsc --noEmit
mkdir -p release
for ch in itch crazygames poki; do
  out="dist-portal/$ch"
  rm -rf "$out"
  VITE_CHANNEL="$ch" npx vite build --base ./ --outDir "$out" --emptyOutDir --logLevel warn
  rm -f "$out/robots.txt" "$out/sitemap.xml"
  if grep -rEl '(src|href)="/[^/]' "$out" --include='*.html' >/dev/null; then echo "absolute path left in $out" >&2; exit 1; fi
  if grep -rl 'SUPABASE_SERVICE_ROLE\|sb_secret_' "$out" >/dev/null; then echo "secret found in $out" >&2; exit 1; fi
  files=$(find "$out" -type f | wc -l | tr -d ' ')
  zip="release/vanful-$ch-v5.zip"
  rm -f "$zip"
  (cd "$out" && zip -qr "../../$zip" .)
  echo "$zip  $files files  $(du -h "$zip" | cut -f1)"
done
