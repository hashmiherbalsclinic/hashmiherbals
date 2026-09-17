"use server";

import { createClient } from "@/lib/supabase/server";
import {
  sendOrderEmails,
  sendOrderStatusUpdateEmail,
} from "@/lib/email/order-emails";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/types";

export async function submitContactMessage(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    return { error: "Please fill in all fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
  });

  if (error) {
    console.error(error);
    return { error: "Could not send message. Please try again." };
  }

  return { ok: true };
}

export type CheckoutPayload = {
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
  city?: string;
  notes?: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  items: Array<{
    product_id?: string;
    product_title: string;
    product_slug?: string;
    size_label?: string;
    unit_price: number;
    quantity: number;
    image?: string;
  }>;
};

export async function placeOrder(payload: CheckoutPayload) {
  if (
    !payload.customer_name?.trim() ||
    !payload.customer_email?.trim() ||
    !payload.phone?.trim() ||
    !payload.address?.trim() ||
    !payload.items?.length
  ) {
    return { error: "Missing order details." };
  }

  const email = payload.customer_email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const orderNumber = `HH-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: payload.customer_name.trim(),
      customer_email: email,
      phone: payload.phone.trim(),
      address: payload.address.trim(),
      city: payload.city?.trim() || null,
      notes: payload.notes?.trim() || null,
      status: "pending",
      subtotal: payload.subtotal,
      shipping_fee: payload.shipping_fee,
      total: payload.total,
      payment_method: "cod",
    })
    .select("id, order_number")
    .single();

  if (error || !order) {
    console.error(error);
    return { error: "Could not place order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    payload.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_title: item.product_title,
      product_slug: item.product_slug || null,
      size_label: item.size_label || null,
      unit_price: item.unit_price,
      quantity: item.quantity,
      image: item.image || null,
    }))
  );

  if (itemsError) {
    console.error(itemsError);
    return { error: "Order created but items failed. Please contact us." };
  }

  try {
    await sendOrderEmails({
      orderNumber: order.order_number,
      customerName: payload.customer_name.trim(),
      customerEmail: email,
      phone: payload.phone.trim(),
      address: payload.address.trim(),
      city: payload.city?.trim(),
      notes: payload.notes?.trim(),
      subtotal: payload.subtotal,
      shippingFee: payload.shipping_fee,
      total: payload.total,
      items: payload.items,
    });
  } catch (mailError) {
    console.error("Order email failed", mailError);
  }

  return { ok: true, orderNumber: order.order_number };
}

/** Admin: update order status and email the customer */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!orderId || !ORDER_STATUSES.includes(status)) {
    return { error: "Invalid order status." };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, phone, status, total"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error(fetchError);
    return { error: "Order not found." };
  }

  if (existing.status === status) {
    return { ok: true, unchanged: true };
  }

  const previousStatus = existing.status as OrderStatus;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    console.error(updateError);
    return { error: "Could not update order status." };
  }

  const customerEmail = String(existing.customer_email || "").trim();
  if (customerEmail) {
    try {
      await sendOrderStatusUpdateEmail({
        orderNumber: existing.order_number,
        customerName: existing.customer_name,
        customerEmail,
        status,
        previousStatus,
        total: existing.total,
        phone: existing.phone,
      });
    } catch (mailError) {
      console.error("Order status email failed", mailError);
      return {
        ok: true,
        warning: "Status updated, but the customer email could not be sent.",
      };
    }
  } else {
    return {
      ok: true,
      warning: "Status updated, but this order has no customer email.",
    };
  }

  return { ok: true };
}
