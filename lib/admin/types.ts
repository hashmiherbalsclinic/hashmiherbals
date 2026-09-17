export type AdminRole = "customer" | "admin";

export type ProductFaqRow = { q: string; a: string };

export type ProductWeightUnit = "g" | "kg";

export type ProductWeightRow = {
  value: number;
  unit: ProductWeightUnit;
  price: number;
  compare_at?: number | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  benefits: string[];
  price: number;
  compare_at: number | null;
  stock: number;
  category: string;
  image: string;
  images: string[];
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  rating: number;
  reviews: number;
  tagline: string | null;
  taste_note: string | null;
  ingredients: string[];
  how_to_use: string[];
  highlights: string[];
  faqs?: ProductFaqRow[];
  weights?: ProductWeightRow[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string | null;
  phone: string;
  address: string;
  city: string | null;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_slug: string | null;
  size_label: string | null;
  unit_price: number;
  quantity: number;
  image: string | null;
};

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  published: boolean;
  read_minutes: number;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const PRODUCT_CATEGORIES = [
  "mens-care",
  "womens-care",
  "majoon",
  "oils",
  "powders",
  "salajeet",
  "digestion",
  "seeds",
] as const;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPk(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}
