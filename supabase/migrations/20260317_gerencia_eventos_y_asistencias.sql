-- Migración para soportar panel de gerencia
-- Ejecutar en Supabase SQL Editor (producción/dev) según corresponda.

-- 1) Eventos: agregar color (para pintar en calendario)
alter table public.eventos
add column if not exists color text;

-- 2) Índice para consultas rápidas por trabajador y fecha
create index if not exists eventos_trabajador_fecha_idx
on public.eventos (trabajador_id, fecha_inicio);

-- 3) Relación (opcional pero recomendado): evento creado por un gerente
-- Nota: `eventos.creado_por` ya existe en tu schema. Aquí lo vinculamos a `gerentes.id`.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'eventos_creado_por_fkey'
  ) then
    alter table public.eventos
    add constraint eventos_creado_por_fkey
    foreign key (creado_por) references public.gerentes(id);
  end if;
end $$;

-- 4) Evitar duplicados de marcación por día (muy recomendado)
create unique index if not exists asistencias_trabajador_fecha_uidx
on public.asistencias (trabajador_id, fecha);

