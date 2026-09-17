-- Product FAQs + public image storage for admin uploads

alter table public.products
  add column if not exists faqs jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin write product images" on storage.objects;
create policy "Admin write product images" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
