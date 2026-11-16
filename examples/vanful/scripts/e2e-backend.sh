#!/usr/bin/env bash
# Real end-to-end: Postgres 17 + PostgREST in Docker, production migrations, Playwright playtest spec,
# then the owner report as service_role. Everything is thrown away afterwards.
set -euo pipefail
cd "$(dirname "$0")/.."
NET=vanful-e2e; PG=vanful-e2e-pg; API=vanful-e2e-api; PORT=54399
cleanup() { docker rm -f $API $PG >/dev/null 2>&1 || true; docker network rm $NET >/dev/null 2>&1 || true; }
cleanup; trap cleanup EXIT
docker network create $NET >/dev/null
docker run -d --name $PG --network $NET -e POSTGRES_PASSWORD=test postgres:17-alpine >/dev/null
until docker exec $PG pg_isready -U postgres >/dev/null 2>&1; do sleep 0.5; done; sleep 1
docker exec -i $PG psql -U postgres -q -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create role authenticator login password 'auth' noinherit; grant anon, service_role to authenticator;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
SQL
for f in supabase/migrations/*.sql; do docker exec -i $PG psql -U postgres -q -v ON_ERROR_STOP=1 >/dev/null 2>&1 < "$f"; done
docker run -d --name $API --network $NET -p $PORT:3000 \
  -e PGRST_DB_URI="postgres://authenticator:auth@$PG:5432/postgres" -e PGRST_DB_SCHEMAS=public \
  -e PGRST_DB_ANON_ROLE=anon postgrest/postgrest:v12.2.3 >/dev/null
until curl -s -o /dev/null http://localhost:$PORT/; do sleep 0.5; done
PGRST_URL=http://localhost:$PORT npx playwright test e2e/playtest.spec.ts --reporter=line
echo "--- owner report (service_role) ---"
docker exec -i $PG psql -U postgres -tA -c "set role service_role; select jsonb_pretty(public.playtest_report());" | sed '/^SET$/d'
echo "--- anon cannot read it back ---"
curl -s "http://localhost:$PORT/play_events?select=id&limit=1"; echo
curl -s -X POST "http://localhost:$PORT/rpc/playtest_report" -H 'Content-Type: application/json' -d '{}'; echo
