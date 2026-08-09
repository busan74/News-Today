-- ============================================================
-- Actualidad Las Cabezas · Esquema de Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- (o con la CLI: supabase db push)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Categorías
-- ------------------------------------------------------------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Noticias (categoria guarda el slug, igual que el modelo anterior)
-- ------------------------------------------------------------
create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  titulo text not null,
  texto text not null,
  imagen text not null default '',
  fecha timestamptz not null default now(),
  portada boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_noticias_categoria on public.noticias (categoria);
create index if not exists idx_noticias_fecha on public.noticias (fecha desc);

-- Migración: columna portada (noticia principal de la home)
-- Idempotente: no falla si ya existe ni la elimina si hay datos.
alter table public.noticias
  add column if not exists portada boolean not null default false;

-- ------------------------------------------------------------
-- Perfiles (uno por usuario de auth.users; aquí viven username y role)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null unique,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Anuncios (publicidad de comercios locales)
-- La suscripción de pago del lector se eliminó; la monetización
-- es publicitaria. stripe_* se usa en la Fase 2 (autoservicio).
-- ------------------------------------------------------------
create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  tipo text not null default 'imagen' check (tipo in ('imagen', 'video')),
  contenido text not null,
  enlace text not null default '',
  activo boolean not null default false,
  posicion integer not null default 0,
  pueblo text not null default '',
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  stripe_customer_id text not null default '',
  stripe_subscription_id text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_anuncios_activo on public.anuncios (activo);

-- Migración: posición de cada anuncio en la parrilla (1-3 izq., 4-6 der., 7-8 grandes)
-- Idempotente: no falla si ya existe ni la elimina si hay datos.
alter table public.anuncios
  add column if not exists posicion integer not null default 0;

alter table public.anuncios
  add column if not exists pueblo text not null default '';

-- ------------------------------------------------------------
-- Row Level Security
-- El backend usa SUPABASE_SECRET_KEY (BYPASSRLS), así que estas
-- políticas solo protegen accesos directos con la publishable key.
-- ------------------------------------------------------------
alter table public.categorias enable row level security;
alter table public.noticias enable row level security;
alter table public.profiles enable row level security;
alter table public.anuncios enable row level security;

-- Lectura pública de categorías y noticias (para el sitio)
-- Se eliminan antes de crear para que el script se pueda re-ejecutar.
drop policy if exists "categorias lectura publica" on public.categorias;
create policy "categorias lectura publica" on public.categorias
  for select using (true);

drop policy if exists "noticias lectura publica" on public.noticias;
create policy "noticias lectura publica" on public.noticias
  for select using (true);

drop policy if exists "anuncios lectura publica" on public.anuncios;
create policy "anuncios lectura publica" on public.anuncios
  for select using (activo = true);

-- El usuario solo ve/edita su propio perfil
drop policy if exists "profiles propio perfil" on public.profiles;
create policy "profiles propio perfil" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles actualizar propio" on public.profiles;
create policy "profiles actualizar propio" on public.profiles
  for update using (auth.uid() = id);

-- Si ya tenías la tabla de suscripciones de la versión anterior:
drop table if exists public.suscripciones cascade;
