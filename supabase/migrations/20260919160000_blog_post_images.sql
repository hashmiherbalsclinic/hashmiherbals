-- Gallery images for blog posts (cover stays in `image`)
alter table public.blog_posts
  add column if not exists images text[] not null default '{}'::text[];

update public.blog_posts
set images = array[image]
where coalesce(cardinality(images), 0) = 0
  and nullif(trim(image), '') is not null;
