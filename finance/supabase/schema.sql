-- Projects Record — Supabase schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again; it only creates what is missing.

-- One row per document. `collection` is the kind of record, `data` holds its fields.
create table if not exists public.pr_docs (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  collection text        not null check (collection in ('records', 'txns', 'salaries', 'audit', 'config')),
  id         text        not null check (length(id) between 1 and 200),
  data       jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, collection, id)
);

comment on table public.pr_docs is 'Projects Record: project records, salaries, transactions, audit log and settings. Each user only ever sees their own rows.';

-- Realtime needs the full old row so deletes reach other devices.
alter table public.pr_docs replica identity full;

-- Keep updated_at current.
create or replace function public.pr_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists pr_docs_touch on public.pr_docs;
create trigger pr_docs_touch before update on public.pr_docs
  for each row execute function public.pr_touch_updated_at();

-- Row level security: every signed-in user reads and writes only their own rows.
alter table public.pr_docs enable row level security;

drop policy if exists "pr read own"   on public.pr_docs;
drop policy if exists "pr insert own" on public.pr_docs;
drop policy if exists "pr update own" on public.pr_docs;
drop policy if exists "pr delete own" on public.pr_docs;

create policy "pr read own" on public.pr_docs
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "pr insert own" on public.pr_docs
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- The audit log is append-only: its rows can be added but never changed or deleted from the app.
create policy "pr update own" on public.pr_docs
  for update to authenticated
  using (user_id = (select auth.uid()) and collection <> 'audit')
  with check (user_id = (select auth.uid()) and collection <> 'audit');

create policy "pr delete own" on public.pr_docs
  for delete to authenticated
  using (user_id = (select auth.uid()) and collection <> 'audit');

-- Anonymous visitors get nothing.
revoke all on public.pr_docs from anon;
grant select, insert, update, delete on public.pr_docs to authenticated;

-- Live sync between devices.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pr_docs') then
    execute 'alter publication supabase_realtime add table public.pr_docs';
  end if;
end $$;

-- Read-only views so the data is easy to browse in the Table Editor or query with SQL.
-- security_invoker makes them obey the same row level security as the table.
create or replace view public.pr_projects with (security_invoker = true) as
select user_id, id,
       (data->>'sr')::int                as sr,
       nullif(data->>'date','')::date    as date,
       data->>'projectType'              as project_type,
       data->>'project'                  as project,
       data->>'client'                   as client,
       data->>'source'                   as source,
       coalesce(data->>'currency','USD') as paid_in,
       data->>'via'                      as received_via,
       (data->>'pieces')::numeric        as pieces,
       (data->>'price')::numeric         as price,
       (data->>'adjustment')::numeric    as adjustment,
       (data->>'fees')::numeric          as fees,
       (data->>'fxRate')::numeric        as fx_rate,
       data->>'worker'                   as worker,
       data->>'clientStatus'             as client_status,
       data->>'workerStatus'             as worker_status,
       data->>'charityStatus'            as share_status,
       updated_at
from public.pr_docs where collection = 'records';

create or replace view public.pr_transactions with (security_invoker = true) as
select user_id, id,
       nullif(data->>'date','')::date as date,
       data->>'type'                  as type,
       data->>'from'                  as from_account,
       data->>'to'                    as to_account,
       data->>'party'                 as party,
       data->>'category'              as category,
       (data->>'amount')::numeric     as amount,
       (data->>'fee')::numeric        as fee,
       (data->>'rate')::numeric       as rate,
       (data->>'received')::numeric   as received,
       data->>'status'                as status,
       coalesce((data->>'estimated')::boolean, false) as estimated,
       data->>'ref'                   as reference,
       data->>'notes'                 as notes,
       updated_at
from public.pr_docs where collection = 'txns';

create or replace view public.pr_salaries with (security_invoker = true) as
select user_id, id,
       data->>'month'                  as month,
       nullif(data->>'date','')::date  as date_received,
       data->>'employer'               as employer,
       data->>'via'                    as received_via,
       data->>'currency'               as currency,
       (data->>'gross')::numeric       as gross,
       (data->>'tax')::numeric         as tax,
       (data->>'deductions')::numeric  as deductions,
       (data->>'gross')::numeric - coalesce((data->>'tax')::numeric,0) - coalesce((data->>'deductions')::numeric,0) as net,
       data->>'status'                 as status,
       updated_at
from public.pr_docs where collection = 'salaries';

-- dropped and recreated so its columns can change between versions (it is only a read-only window on pr_docs)
drop view if exists public.pr_audit_log;
create view public.pr_audit_log with (security_invoker = true) as
select user_id, id,
       (data->>'ts')::timestamptz as at,
       data->>'action'            as action,
       data->>'module'            as module,
       data->>'label'             as item,
       data->>'summary'           as summary,
       data->'changes'            as changes,
       created_at,
       data->'snapshot'           as deleted_copy
from public.pr_docs where collection = 'audit';

revoke all on public.pr_projects, public.pr_transactions, public.pr_salaries, public.pr_audit_log from anon;
grant select on public.pr_projects, public.pr_transactions, public.pr_salaries, public.pr_audit_log to authenticated;
