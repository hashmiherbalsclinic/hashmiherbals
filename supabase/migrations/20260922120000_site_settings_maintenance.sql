-- Site-wide settings (maintenance mode, etc.)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default 'false'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Public can read settings (needed for storefront maintenance gate)
drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Admins can update settings
drop policy if exists "Admins update site_settings" on public.site_settings;
create policy "Admins update site_settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins insert site_settings" on public.site_settings;
create policy "Admins insert site_settings"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

insert into public.site_settings (key, value)
values ('maintenance_mode', 'false'::jsonb)
on conflict (key) do nothing;
