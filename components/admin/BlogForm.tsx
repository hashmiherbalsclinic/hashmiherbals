"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, type BlogPostRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";

const field =
  "mt-1.5 w-full rounded-xl border border-[#d8e0d6] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#74a13a] focus:ring-2 focus:ring-[#74a13a]/25";
const labelCls = "block text-sm font-medium text-[#0f2a22]";

type Props = {
  post?: BlogPostRow | null;
};

export function BlogForm({ post }: Props) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [category, setCategory] = useState(post?.category ?? "Wellness");
  const [image, setImage] = useState(post?.image ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [readMinutes, setReadMinutes] = useState(
    String(post?.read_minutes ?? 5)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const now = new Date().toISOString();
    const payload = {
      title: title.trim(),
      slug: slugify(slug || title),
      excerpt: excerpt.trim(),
      body: body.trim(),
      category: category.trim() || "Wellness",
      image: image.trim(),
      published,
      read_minutes: Number(readMinutes) || 5,
      published_at: published
        ? post?.published
          ? post.published_at
          : now
        : post?.published_at ?? now,
      updated_at: now,
    };

    const supabase = createClient();
    if (isEdit && post) {
      const { error: err } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", post.id);
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
    } else {
      const { error: err } = await supabase.from("blog_posts").insert(payload);
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
    }

    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7"
    >
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Title
          <input
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Slug
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={field}
          />
        </label>
      </div>

      <label className={labelCls}>
        Excerpt
        <textarea
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={field}
        />
      </label>

      <label className={labelCls}>
        Body
        <textarea
          required
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={field}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelCls}>
          Category
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Image URL
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={field}
            placeholder="https://…"
          />
        </label>
        <label className={labelCls}>
          Read minutes
          <input
            type="number"
            min={1}
            value={readMinutes}
            onChange={(e) => setReadMinutes(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 rounded-xl bg-[#f3f6f2] px-4 py-3 text-sm font-medium text-[#0f2a22]">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-[#d8e0d6] text-[#74a13a] focus:ring-[#74a13a]"
        />
        Published
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Update post" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className="rounded-xl border border-[#d8e0d6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a22] hover:bg-[#f3f6f2]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
