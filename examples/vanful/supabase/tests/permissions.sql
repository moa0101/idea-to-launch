-- Run against a scratch Postgres after the migrations: npm run db:test
\set ON_ERROR_STOP on
set role anon;
insert into public.play_events (device, session, event, props, app_version) values (gen_random_uuid(), gen_random_uuid(), 'tutorial_start', '{}', 'v4');
insert into public.feedback (device, door_rule, fun, play_tomorrow, comment) values ('00000000-0000-0000-0000-000000000001', 'yes', 4, 'maybe', 'fun!');
insert into public.waitlist (email, source) values ('player@example.com', 'test');
reset role;
\set ON_ERROR_STOP off
-- Each of these must FAIL; the runner counts the errors.
set role anon;
select count(*) from public.play_events;
select count(*) from public.feedback;
select count(*) from public.waitlist;
update public.play_events set event = 'undo';
delete from public.feedback;
insert into public.play_events (device, session, event) values (gen_random_uuid(), gen_random_uuid(), 'hack');
insert into public.play_events (device, session, event, props) values (gen_random_uuid(), gen_random_uuid(), 'undo', jsonb_build_object('x', repeat('a', 3000)));
insert into public.play_events (device, session, event, created_at) values (gen_random_uuid(), gen_random_uuid(), 'undo', now() - interval '9 days');
insert into public.play_events (device, session, event, client_ts) values (gen_random_uuid(), gen_random_uuid(), 'undo', now() - interval '9 days');
insert into public.feedback (device, door_rule, fun, play_tomorrow) values ('00000000-0000-0000-0000-000000000001', 'no', 1, 'no');
insert into public.feedback (device, door_rule, fun, play_tomorrow) values (gen_random_uuid(), 'yes', 9, 'yes');
select public.playtest_report();
reset role;
