import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import type { BlogPostRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return <BlogForm post={data as BlogPostRow} />;
}
