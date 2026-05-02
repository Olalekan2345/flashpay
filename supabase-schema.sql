-- FlashPay Private — Supabase Schema
-- Run this in your Supabase SQL editor before deploying.

create extension if not exists "pgcrypto";

-- ── Employers ──────────────────────────────────────────────────────────────

create table if not exists employers (
  id              text primary key default 'emp_' || gen_random_uuid(),
  name            text not null,
  email           text not null unique,
  password_hash   text not null default '',
  company_name    text not null,
  company_logo    text,
  wallet_address  text,
  treasury_balance numeric(18,6) not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Employees ──────────────────────────────────────────────────────────────

create table if not exists employees (
  id                text primary key default 'worker_' || gen_random_uuid(),
  employer_id       text not null references employers(id) on delete cascade,
  full_name         text not null,
  email             text not null unique,
  country           text not null default '',
  job_role          text not null default '',
  wallet_address    text,
  pay_frequency     text not null default 'monthly',
  salary_encrypted  text not null default '',
  salary_token      text not null default '',
  status            text not null default 'pending_onboarding',
  invite_token      text unique,
  invite_expires_at timestamptz,
  next_pay_date     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Payroll Records ────────────────────────────────────────────────────────

create table if not exists payroll_records (
  id               text primary key default 'pay_' || gen_random_uuid(),
  employer_id      text not null references employers(id) on delete cascade,
  employee_id      text not null references employees(id) on delete cascade,
  employee_name    text not null,
  employee_role    text not null,
  amount           numeric(18,6) not null,
  currency         text not null default 'USDC',
  tx_signature     text,
  status           text not null default 'pending',
  pay_period_start text not null,
  pay_period_end   text not null,
  paid_at          timestamptz,
  payslip_data     text,
  arcium_proof     text,
  created_at       timestamptz not null default now()
);

-- ── Treasury Transactions ──────────────────────────────────────────────────

create table if not exists treasury_transactions (
  id           text primary key default 'tx_' || gen_random_uuid(),
  employer_id  text not null references employers(id) on delete cascade,
  type         text not null check (type in ('deposit','withdrawal','payment')),
  amount       numeric(18,6) not null,
  tx_signature text,
  description  text not null default '',
  created_at   timestamptz not null default now()
);

-- ── Auto-update updated_at ─────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger employers_updated_at
  before update on employers
  for each row execute function update_updated_at();

create trigger employees_updated_at
  before update on employees
  for each row execute function update_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────
-- All reads/writes go through the service role key (server-side only).
-- Disable RLS so the service role can operate freely.

alter table employers           disable row level security;
alter table employees           disable row level security;
alter table payroll_records     disable row level security;
alter table treasury_transactions disable row level security;
