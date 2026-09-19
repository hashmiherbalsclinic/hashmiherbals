-- Blog cover / inline image uploads (public bucket, admin write)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read blog images" on storage.objects;
create policy "Public read blog images" on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "Admin write blog images" on storage.objects;
create policy "Admin write blog images" on storage.objects for all
  using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());
