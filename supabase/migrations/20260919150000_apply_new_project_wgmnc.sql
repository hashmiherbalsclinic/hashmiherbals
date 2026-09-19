-- ============================================================
-- Hashmi Herbals — apply on project wgmnccepkjvtxozzirxo
-- Safe / idempotent: does NOT drop existing tables or data.
-- Run once in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles + auth helpers ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text;
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

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- products ----------
create table if not exists public.products (
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

alter table public.products add column if not exists faqs jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists weights jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists benefits text[] not null default '{}';
alter table public.products add column if not exists ingredients text[] not null default '{}';
alter table public.products add column if not exists how_to_use text[] not null default '{}';
alter table public.products add column if not exists highlights text[] not null default '{}';
create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx on public.products (active);
alter table public.products enable row level security;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- orders ----------
create table if not exists public.orders (
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

alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_user_id_idx on public.orders (user_id);
alter table public.orders enable row level security;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
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

-- ---------- blog_posts ----------
create table if not exists public.blog_posts (
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

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ---------- contact ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;

-- ---------- RLS policies ----------
drop policy if exists "Profiles read own or admin" on public.profiles;
create policy "Profiles read own or admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists "Profiles admin update" on public.profiles;
create policy "Profiles admin update" on public.profiles for update
  using (public.is_admin());
drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Products public read active" on public.products;
create policy "Products public read active" on public.products for select
  using (active = true or public.is_admin());
drop policy if exists "Products admin write" on public.products;
create policy "Products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Orders public insert" on public.orders;
create policy "Orders public insert" on public.orders
  for insert to anon, authenticated with check (true);
drop policy if exists "Orders admin read" on public.orders;
create policy "Orders admin read" on public.orders for select using (public.is_admin());
drop policy if exists "Orders admin update" on public.orders;
create policy "Orders admin update" on public.orders for update using (public.is_admin());
drop policy if exists "Orders admin delete" on public.orders;
create policy "Orders admin delete" on public.orders for delete using (public.is_admin());
drop policy if exists "Orders customer read own" on public.orders;
create policy "Orders customer read own" on public.orders
  for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Order items public insert" on public.order_items;
create policy "Order items public insert" on public.order_items
  for insert to anon, authenticated with check (true);
drop policy if exists "Order items admin read" on public.order_items;
create policy "Order items admin read" on public.order_items for select using (public.is_admin());
drop policy if exists "Order items admin write" on public.order_items;
create policy "Order items admin write" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Order items customer read own" on public.order_items;
create policy "Order items customer read own" on public.order_items
  for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

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

-- ---------- order tracking RPC ----------
create or replace function public.get_order_tracking(p_order_number text)
returns table (
  order_number text,
  status text,
  total numeric,
  created_at timestamptz,
  item_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    o.order_number,
    o.status,
    o.total,
    o.created_at,
    (
      select coalesce(sum(oi.quantity), 0)
      from public.order_items oi
      where oi.order_id = o.id
    ) as item_count
  from public.orders o
  where upper(trim(o.order_number)) = upper(trim(p_order_number))
  limit 1;
$$;

revoke all on function public.get_order_tracking(text) from public;
grant execute on function public.get_order_tracking(text) to anon, authenticated;

-- ---------- storage buckets ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin write product images" on storage.objects;
create policy "Admin write product images" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Public read blog images" on storage.objects;
create policy "Public read blog images" on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "Admin write blog images" on storage.objects;
create policy "Admin write blog images" on storage.objects for all
  using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());

-- ---------- promote yourself to admin (edit email, then uncomment) ----------
-- update public.profiles set role = 'admin' where email = 'your@email.com';
