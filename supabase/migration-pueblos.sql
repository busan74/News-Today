-- ============================================================
-- Actualidad Local · Red de portales por pueblo (multi-tenant)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Proyecto: wfhateozxyernzqgiofu
-- ============================================================

-- 1) Columna 'pueblo' en tablas existentes (default lascabezas)
alter table public.noticias add column if not exists pueblo text not null default 'lascabezas';
alter table public.categorias add column if not exists pueblo text not null default 'lascabezas';
alter table public.anuncios add column if not exists pueblo text not null default 'lascabezas';

-- 2) Índices por pueblo
create index if not exists idx_noticias_pueblo on public.noticias (pueblo);
create index if not exists idx_categorias_pueblo on public.categorias (pueblo);
create index if not exists idx_anuncios_pueblo on public.anuncios (pueblo);

-- 3) Tabla de pueblos (configuración de cada portal)
create table if not exists public.pueblos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  logo text not null default '',
  color text not null default '#b3062e',
  dominio text not null default '',
  descripcion text not null default '',
  created_at timestamptz not null default now()
);

insert into public.pueblos (slug, nombre, logo, color, dominio, descripcion) values
  ('lascabezas', 'Actualidad Las Cabezas', 'LC', '#b3062e', 'lascabezas.actualidadlocal.es', 'Noticias de Las Cabezas de San Juan'),
  ('lebrija', 'Actualidad Lebrija', 'LB', '#0f766e', 'lebrija.actualidadlocal.es', 'Noticias de Lebrija'),
  ('elcuervo', 'Actualidad El Cuervo', 'EC', '#4338ca', 'elcuervo.actualidadlocal.es', 'Noticias de El Cuervo de Sevilla')
on conflict (slug) do update set
  nombre = excluded.nombre,
  logo = excluded.logo,
  color = excluded.color,
  dominio = excluded.dominio,
  descripcion = excluded.descripcion;

-- 4) RLS para la tabla pueblos (lectura pública)
alter table public.pueblos enable row level security;
drop policy if exists "pueblos lectura publica" on public.pueblos;
create policy "pueblos lectura publica" on public.pueblos
  for select using (true);

-- 5) Añadir 'pueblo' a las políticas de lectura existentes ya cubiertas por using(true).
--    Las políticas de lectura ya permiten todo (using true), así que no hace falta cambiarlas.
--    Los insert/update del backend usan la SUPABASE_SECRET_KEY (BYPASSRLS).
