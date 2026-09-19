-- Public order tracking by order number (limited fields only).
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
