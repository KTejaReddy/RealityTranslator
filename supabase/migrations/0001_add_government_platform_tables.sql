-- Add new tables for the government platform features.
-- This is additive only (no changes to existing tables).

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  email text not null,
  password text not null,
  constraint users_role_check check (role in ('user', 'government')),
  constraint users_email_role_unique unique (email, role)
);

create table if not exists public.simulations (
  id text primary key,
  name text not null,
  type text not null,
  region text not null,
  data jsonb not null,
  created_by text not null,
  created_at bigint not null
);

create table if not exists public.datasets (
  id text primary key,
  name text not null,
  type text not null,
  region text not null,
  source text not null,
  format text not null,
  uploaded_by text not null,
  uploaded_at bigint not null
);

create table if not exists public.government_requests (
  id text primary key,
  type text not null,
  region text not null,
  parameters jsonb not null,
  status text not null,
  created_at bigint not null
);

