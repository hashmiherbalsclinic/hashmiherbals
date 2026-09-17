-- Multiple pack weights (g / kg) with per-weight pricing

alter table public.products
  add column if not exists weights jsonb not null default '[]'::jsonb;
