import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return <ProductForm product={data as ProductRow} />;
}
