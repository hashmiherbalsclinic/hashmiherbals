-- Customer auth: allow users to update their own profile + link orders to accounts

alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Orders customer read own" on public.orders;
create policy "Orders customer read own" on public.orders
  for select
  using (auth.uid() = user_id or public.is_admin());

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
