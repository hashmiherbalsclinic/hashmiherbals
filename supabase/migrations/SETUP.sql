-- ============================================================
-- HASHMI HERBALS - run this ENTIRE file once in SQL Editor
-- Do NOT run the old migration. This one DROPs old tables first.
-- ============================================================

create extension if not exists "pgcrypto";

drop table if exists public.product_reviews cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.blogs cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(coalesce(new.raw_user_meta_data->>'phone', ''), ''),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  benefits text[] not null default '{}',
  price numeric(12,2) not null check (price >= 0),
  compare_at numeric(12,2),
  stock integer not null default 0 check (stock >= 0),
  category text not null,
  image text not null default '',
  images text[] not null default '{}',
  featured boolean not null default false,
  bestseller boolean not null default false,
  new_arrival boolean not null default false,
  rating numeric(3,2) not null default 5,
  reviews integer not null default 0,
  tagline text,
  taste_note text,
  ingredients text[] not null default '{}',
  how_to_use text[] not null default '{}',
  highlights text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  weights jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_active_idx on public.products (active);
alter table public.products enable row level security;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  city text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  payment_method text not null default 'cod',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders (created_at desc);
alter table public.orders enable row level security;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_title text not null,
  product_slug text,
  size_label text,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  image text
);
alter table public.order_items enable row level security;

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  category text not null default 'General',
  image text not null default '',
  published boolean not null default true,
  read_minutes integer not null default 3,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop policy if exists "Profiles read own or admin" on public.profiles;
create policy "Profiles read own or admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists "Profiles admin update" on public.profiles;
create policy "Profiles admin update" on public.profiles for update
  using (public.is_admin());

drop policy if exists "Products public read active" on public.products;
create policy "Products public read active" on public.products for select
  using (active = true or public.is_admin());
drop policy if exists "Products admin write" on public.products;
create policy "Products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Orders public insert" on public.orders;
create policy "Orders public insert" on public.orders for insert with check (true);
drop policy if exists "Orders admin read" on public.orders;
create policy "Orders admin read" on public.orders for select using (public.is_admin());
drop policy if exists "Orders admin update" on public.orders;
create policy "Orders admin update" on public.orders for update using (public.is_admin());
drop policy if exists "Orders admin delete" on public.orders;
create policy "Orders admin delete" on public.orders for delete using (public.is_admin());

drop policy if exists "Order items public insert" on public.order_items;
create policy "Order items public insert" on public.order_items for insert with check (true);
drop policy if exists "Order items admin read" on public.order_items;
create policy "Order items admin read" on public.order_items for select using (public.is_admin());
drop policy if exists "Order items admin write" on public.order_items;
create policy "Order items admin write" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Blogs public read published" on public.blog_posts;
create policy "Blogs public read published" on public.blog_posts for select
  using (published = true or public.is_admin());
drop policy if exists "Blogs admin write" on public.blog_posts;
create policy "Blogs admin write" on public.blog_posts for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Messages public insert" on public.contact_messages;
create policy "Messages public insert" on public.contact_messages for insert with check (true);
drop policy if exists "Messages admin read" on public.contact_messages;
create policy "Messages admin read" on public.contact_messages for select using (public.is_admin());
drop policy if exists "Messages admin update" on public.contact_messages;
create policy "Messages admin update" on public.contact_messages for update using (public.is_admin());
drop policy if exists "Messages admin delete" on public.contact_messages;
create policy "Messages admin delete" on public.contact_messages for delete using (public.is_admin());

-- Storage: product image uploads (public read, admin write)
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

-- Done. After this, create an Auth user in Supabase Dashboard, then run:
-- update public.profiles set role = 'admin' where email = 'your@email.com';
