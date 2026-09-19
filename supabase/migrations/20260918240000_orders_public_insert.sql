-- Ensure guest/customer COD checkout can insert orders + line items.
-- (SELECT after insert is handled in app code by providing ids up front.)

drop policy if exists "Orders public insert" on public.orders;
create policy "Orders public insert" on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Order items public insert" on public.order_items;
create policy "Order items public insert" on public.order_items
  for insert
  to anon, authenticated
  with check (true);
