#!/usr/bin/env bash
# Tests the migrations' permissions on a throwaway Postgres 17 container (Supabase-like roles).
set -euo pipefail
cd "$(dirname "$0")/../.."
NAME=vanful-dbtest
docker rm -f $NAME >/dev/null 2>&1 || true
docker run -d --name $NAME -e POSTGRES_PASSWORD=test postgres:17-alpine >/dev/null
trap 'docker rm -f $NAME >/dev/null 2>&1' EXIT
until docker exec $NAME pg_isready -U postgres >/dev/null 2>&1; do sleep 0.5; done
sleep 1
psql() { docker exec -i $NAME psql -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
# Supabase-like roles and default grants (Supabase grants all on public tables to these by default).
psql <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
SQL
for f in supabase/migrations/*.sql; do psql < "$f"; done
OUT=$(docker exec -i $NAME psql -U postgres -q < supabase/tests/permissions.sql 2>&1 || true)
ERRORS=$(echo "$OUT" | grep -c "ERROR" || true)
echo "$OUT" | grep "ERROR" | sed 's/^/  blocked: /'
# owner report works as service_role
REPORT=$(docker exec -i $NAME psql -U postgres -tA -c "set role service_role; select public.playtest_report();")
echo "report (service_role): $REPORT"
EXPECTED=12
if [ "$ERRORS" -eq "$EXPECTED" ]; then echo "PASS: anon could insert, and all $EXPECTED forbidden actions were blocked"; else echo "FAIL: expected $EXPECTED blocked actions, got $ERRORS"; exit 1; fi
