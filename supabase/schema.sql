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
  created_at timestamptz not null default now()
);

create index if not exists idx_noticias_categoria on public.noticias (categoria);
create index if not exists idx_noticias_fecha on public.noticias (fecha desc);

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
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  stripe_customer_id text not null default '',
  stripe_subscription_id text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_anuncios_activo on public.anuncios (activo);

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
create policy "categorias lectura publica" on public.categorias
  for select using (true);

create policy "noticias lectura publica" on public.noticias
  for select using (true);

create policy "anuncios lectura publica" on public.anuncios
  for select using (activo = true);

-- El usuario solo ve/edita su propio perfil
create policy "profiles propio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles actualizar propio" on public.profiles
  for update using (auth.uid() = id);

-- Si ya tenías la tabla de suscripciones de la versión anterior:
drop table if exists public.suscripciones cascade;
