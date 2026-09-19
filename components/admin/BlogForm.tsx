"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Sparkles, Upload, Copy, Check, X } from "lucide-react";
import { BlogRichEditor } from "@/components/admin/BlogRichEditor";
import { slugify, type BlogPostRow } from "@/lib/admin/types";
import { revalidateBlogsCache } from "@/lib/admin/actions";
import { generateBlogDraft } from "@/lib/admin/blog-generate";
import { generateBlogPhotoPrompt } from "@/lib/admin/blog-photo-prompt";
import { prepareBlogWebpUpload } from "@/lib/admin/to-webp";
import { createClient } from "@/lib/supabase/client";
import { toUserFacingError } from "@/lib/errors/user-message";
import { ErrorAlert } from "@/components/errors/ErrorAlert";

const field =
  "mt-1.5 w-full rounded-xl border border-[#d8e0d6] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1f5c45] focus:ring-2 focus:ring-[#1f5c45]/20";
const labelCls = "block text-sm font-medium text-[#0f2a22]";

const BLOG_CATEGORIES = [
  "Wellness",
  "Oils",
  "Salajeet",
  "Majoon",
  "Digestion",
  "Powders",
  "Seeds",
  "Men's Care",
  "Women's Care",
  "Shopping",
  "Clinic",
] as const;

type Props = {
  post?: BlogPostRow | null;
};

function estimateReadMinutes(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function isEmptyHtml(html: string) {
  const text = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length === 0;
}

export function BlogForm({ post }: Props) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [category, setCategory] = useState(post?.category ?? "Wellness");
  const [image, setImage] = useState(post?.image ?? "");
  const [gallery, setGallery] = useState<string[]>(() => {
    const fromDb = (post?.images ?? []).filter(Boolean);
    if (fromDb.length) return fromDb;
    return post?.image ? [post.image] : [];
  });
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [published, setPublished] = useState(post?.published ?? false);
  const [readMinutes, setReadMinutes] = useState(
    String(post?.read_minutes ?? 5)
  );
  const [autoRead, setAutoRead] = useState(!post);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [photoPromptLoading, setPhotoPromptLoading] = useState(false);
  const [photoPrompt, setPhotoPrompt] = useState<string | null>(null);
  const [photoNegative, setPhotoNegative] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"prompt" | "negative" | null>(
    null
  );

  const [aiTopic, setAiTopic] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [aiTone, setAiTone] = useState<"educational" | "warm" | "clinical">(
    "educational"
  );
  const [aiLength, setAiLength] = useState<"short" | "medium" | "long">(
    "medium"
  );
  const [aiLanguage, setAiLanguage] = useState<"en" | "ur">("en");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onBodyChange(html: string) {
    setBody(html);
    if (autoRead) setReadMinutes(String(estimateReadMinutes(html)));
  }

  async function onGenerateAi() {
    setError(null);
    setAiMessage(null);

    if (!aiTopic.trim()) {
      setError("Enter a topic for the AI blog draft.");
      return;
    }

    const hasExisting =
      title.trim() ||
      excerpt.trim() ||
      !isEmptyHtml(body);

    if (hasExisting) {
      const ok = window.confirm(
        "AI will replace the current title, excerpt, category, and body. Continue?"
      );
      if (!ok) return;
    }

    setAiLoading(true);
    try {
      const result = await generateBlogDraft({
        topic: aiTopic.trim(),
        notes: aiNotes.trim() || undefined,
        tone: aiTone,
        length: aiLength,
        language: aiLanguage,
      });

      if (!result.ok) {
        setError(toUserFacingError(result.error, "admin"));
        return;
      }

      setTitle(result.title);
      // Urdu titles don't slugify well — build slug from English topic instead
      setSlug(
        slugify(aiLanguage === "ur" ? aiTopic : result.title) ||
          slugify(aiTopic) ||
          `post-${Date.now()}`
      );
      setSlugTouched(aiLanguage === "ur");
      setExcerpt(result.excerpt);
      setCategory(result.category);
      onBodyChange(result.bodyHtml);
      setAiMessage(
        aiLanguage === "ur"
          ? `اردو ڈرافٹ شامل ہو گیا${result.modelId ? ` (${result.modelId})` : ""} — جائزہ لیں، کور تصویر لگائیں، پھر محفوظ کریں۔`
          : `Draft inserted${result.modelId ? ` via ${result.modelId}` : ""} — review, add a cover image, then save.`
      );
    } catch (err) {
      setError(toUserFacingError(err, "admin"));
    } finally {
      setAiLoading(false);
    }
  }

  function blogImageNameHint() {
    return slug.trim() || title.trim() || aiTopic.trim() || "blog-post";
  }

  async function uploadImageFile(file: File, folder: "covers" | "gallery") {
    const role = folder === "covers" ? "cover" : "gallery";
    const { file: webp, storagePath } = await prepareBlogWebpUpload(file, {
      nameHint: blogImageNameHint(),
      role,
      index: role === "gallery" ? gallery.length + 1 : undefined,
    });
    const supabase = createClient();
    const { error: upErr } = await supabase.storage
      .from("blog-images")
      .upload(storagePath, webp, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/webp",
      });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("blog-images").getPublicUrl(storagePath);
    return data.publicUrl;
  }

  function addToGallery(url: string) {
    setGallery((prev) => (prev.includes(url) ? prev : [...prev, url]));
  }

  async function uploadCover(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploadingCover(true);
    try {
      const url = await uploadImageFile(files[0], "covers");
      setImage(url);
      addToGallery(url);
    } catch (err) {
      setError(toUserFacingError(err, "admin"));
    } finally {
      setUploadingCover(false);
      if (coverRef.current) coverRef.current.value = "";
    }
  }

  async function uploadGallery(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImageFile(file, "gallery"));
      }
      setGallery((prev) => {
        const next = [...prev];
        for (const url of urls) {
          if (!next.includes(url)) next.push(url);
        }
        return next;
      });
      if (!image && urls[0]) setImage(urls[0]);
    } catch (err) {
      setError(toUserFacingError(err, "admin"));
    } finally {
      setUploadingGallery(false);
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  function removeGalleryImage(url: string) {
    setGallery((prev) => prev.filter((u) => u !== url));
    if (image === url) {
      setImage((prev) => (prev === url ? "" : prev));
    }
  }

  function insertImageIntoBody(url: string) {
    const tag = `<p><img src="${url}" alt="" /></p>`;
    onBodyChange(isEmptyHtml(body) ? tag : `${body}${tag}`);
    setAiMessage("Image inserted into content — scroll to the editor to place it.");
  }

  async function onGeneratePhotoPrompt() {
    setError(null);
    setAiMessage(null);

    const topicForImage = aiTopic.trim() || title.trim() || excerpt.trim();
    if (!topicForImage) {
      setError(
        "Enter an AI topic or post title first so the photo prompt matches the blog."
      );
      return;
    }

    setPhotoPromptLoading(true);
    try {
      const result = await generateBlogPhotoPrompt({
        topic: topicForImage,
        title: title.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        category: category.trim() || undefined,
        notes: aiNotes.trim() || undefined,
        language: aiLanguage,
      });
      if (!result.ok) {
        setError(toUserFacingError(result.error, "admin"));
        return;
      }
      setPhotoPrompt(result.prompt);
      setPhotoNegative(result.negativePrompt);
      setPhotoCaption(result.shortCaption);
      setAiMessage(
        `Ultra-realistic photo prompt ready${result.modelId ? ` (${result.modelId})` : ""} — copy it into Gemini / Midjourney, then upload the result here.`
      );
    } catch (err) {
      setError(toUserFacingError(err, "admin"));
    } finally {
      setPhotoPromptLoading(false);
    }
  }

  async function copyText(text: string, field: "prompt" | "negative") {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1600);
    } catch {
      setError("Could not copy — select the text manually.");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!excerpt.trim()) {
      setError("Excerpt is required.");
      return;
    }
    if (isEmptyHtml(body)) {
      setError("Write some blog content before saving.");
      return;
    }
    if (!image.trim()) {
      setError("Please upload a cover image.");
      return;
    }

    setLoading(true);
    const now = new Date().toISOString();
    const minutes = autoRead
      ? estimateReadMinutes(body)
      : Number(readMinutes) || 5;

    const galleryImages = Array.from(
      new Set([...(image.trim() ? [image.trim()] : []), ...gallery.filter(Boolean)])
    );

    const payload = {
      title: title.trim(),
      slug: slugify(slug || title),
      excerpt: excerpt.trim(),
      body: body.trim(),
      category: category.trim() || "Wellness",
      image: image.trim(),
      images: galleryImages,
      published,
      read_minutes: minutes,
      published_at: published
        ? post?.published
          ? post.published_at
          : now
        : (post?.published_at ?? now),
      updated_at: now,
    };

    const supabase = createClient();
    if (isEdit && post) {
      const { error: err } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", post.id);
      if (err) {
        setLoading(false);
        setError(toUserFacingError(err.message, "admin"));
        return;
      }
    } else {
      const { error: err } = await supabase.from("blog_posts").insert(payload);
      if (err) {
        setLoading(false);
        setError(toUserFacingError(err.message, "admin"));
        return;
      }
    }

    try {
      await revalidateBlogsCache();
    } catch {
      // Cache refresh is best-effort; post is already saved.
    }

    setLoading(false);
    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      {error && (
        <ErrorAlert
          error={error}
          audience="admin"
          onDismiss={() => setError(null)}
        />
      )}
      {aiMessage && (
        <div className="rounded-xl border border-[#c5d9c8] bg-[#f3f8f2] px-4 py-3 text-sm text-[#174a37]">
          {aiMessage}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-[#d8e0d6] bg-gradient-to-br from-[#f8faf7] to-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
              AI blog bot
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#0f2a22]">
              Generate draft with Gemini
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Creates title, excerpt, category, and rich HTML body in English or
              Urdu. You still upload the cover and publish when ready.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f5c45]/10 px-2.5 py-1 text-xs font-semibold text-[#1f5c45]">
            <Sparkles className="h-3.5 w-3.5" />
            Gemini Flash-Lite
          </span>
        </div>

        <label className={labelCls}>
          Topic
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            className={field}
            placeholder="e.g. Benefits of Kalonji oil for winter immunity"
            disabled={aiLoading || loading}
          />
        </label>

        <label className={labelCls}>
          Extra notes (optional)
          <textarea
            rows={2}
            value={aiNotes}
            onChange={(e) => setAiNotes(e.target.value)}
            className={field}
            placeholder="Mention Unani context, avoid hard sell, target women’s care…"
            disabled={aiLoading || loading}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelCls}>
            Language
            <select
              value={aiLanguage}
              onChange={(e) => setAiLanguage(e.target.value as "en" | "ur")}
              className={field}
              disabled={aiLoading || loading}
            >
              <option value="en">English</option>
              <option value="ur">Urdu (اردو)</option>
            </select>
          </label>
          <label className={labelCls}>
            Tone
            <select
              value={aiTone}
              onChange={(e) =>
                setAiTone(e.target.value as "educational" | "warm" | "clinical")
              }
              className={field}
              disabled={aiLoading || loading}
            >
              <option value="educational">Educational</option>
              <option value="warm">Warm / story-led</option>
              <option value="clinical">Clinical / Unani</option>
            </select>
          </label>
          <label className={labelCls}>
            Length
            <select
              value={aiLength}
              onChange={(e) =>
                setAiLength(e.target.value as "short" | "medium" | "long")
              }
              className={field}
              disabled={aiLoading || loading}
            >
              <option value="short">Short (~500 words)</option>
              <option value="medium">Medium (~900 words)</option>
              <option value="long">Long (~1400 words)</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={onGenerateAi}
          disabled={aiLoading || loading || uploadingCover}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
        >
          {aiLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating draft…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate &amp; insert into form
            </>
          )}
        </button>
      </section>

      <section className="space-y-5 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
            Post details
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#0f2a22]">
            {isEdit ? "Edit blog post" : "Create blog post"}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            Title
            <input
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={field}
              placeholder="Kalonji oil for everyday wellness"
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
              placeholder="kalonji-oil-everyday-wellness"
            />
          </label>
        </div>

        <label className={labelCls}>
          Excerpt
          <textarea
            required
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={field}
            placeholder="Short summary shown on the blogs listing and SEO description."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelCls}>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={field}
            >
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            Read minutes
            <input
              type="number"
              min={1}
              value={readMinutes}
              disabled={autoRead}
              onChange={(e) => {
                setAutoRead(false);
                setReadMinutes(e.target.value);
              }}
              className={`${field} disabled:bg-[#f3f6f2]`}
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm font-medium text-[#0f2a22]">
            <input
              type="checkbox"
              checked={autoRead}
              onChange={(e) => {
                setAutoRead(e.target.checked);
                if (e.target.checked) {
                  setReadMinutes(String(estimateReadMinutes(body)));
                }
              }}
              className="h-4 w-4 rounded border-[#d8e0d6] text-[#1f5c45] focus:ring-[#1f5c45]"
            />
            Auto-estimate from content
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
            Images
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#0f2a22]">Cover &amp; gallery</h2>
          <p className="mt-1 text-sm text-stone-500">
            JPG/PNG uploads are converted to WebP and renamed from the post
            slug (e.g. kalonji-oil-cover-….webp). You can also paste a URL, add
            gallery photos, or get an ultra-realistic photo prompt.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setImageMode("upload")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              imageMode === "upload"
                ? "bg-[#1f5c45] text-white"
                : "bg-[#f3f6f2] text-[#0f2a22] hover:bg-[#e8eee6]"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload cover
          </button>
          <button
            type="button"
            onClick={() => setImageMode("url")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              imageMode === "url"
                ? "bg-[#1f5c45] text-white"
                : "bg-[#f3f6f2] text-[#0f2a22] hover:bg-[#e8eee6]"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            Cover from URL
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploadingGallery || loading || photoPromptLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3f6f2] px-3 py-1.5 text-xs font-semibold text-[#0f2a22] transition hover:bg-[#e8eee6] disabled:opacity-60"
          >
            {uploadingGallery ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            Add gallery photos
          </button>
          <button
            type="button"
            onClick={onGeneratePhotoPrompt}
            disabled={
              photoPromptLoading || loading || uploadingCover || uploadingGallery
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f5c45] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
          >
            {photoPromptLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {photoPromptLoading
              ? "Writing prompt…"
              : "Get ultra-realistic photo prompt"}
          </button>
        </div>

        {photoPrompt && (
          <div className="space-y-3 rounded-2xl border border-[#c5d9c8] bg-[#f7faf6] p-4">
            {photoCaption && (
              <p className="text-sm font-medium text-[#174a37]">{photoCaption}</p>
            )}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1f5c45]/80">
                  Photo prompt
                </p>
                <button
                  type="button"
                  onClick={() => copyText(photoPrompt, "prompt")}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#0f2a22] shadow-sm hover:bg-[#f3f6f2]"
                >
                  {copiedField === "prompt" ? (
                    <Check className="h-3.5 w-3.5 text-[#1f5c45]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedField === "prompt" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={photoPrompt}
                className={`${field} mt-0 resize-y bg-white font-mono text-xs leading-relaxed`}
              />
            </div>
            {photoNegative && (
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1f5c45]/80">
                    Negative prompt
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText(photoNegative, "negative")}
                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#0f2a22] shadow-sm hover:bg-[#f3f6f2]"
                  >
                    {copiedField === "negative" ? (
                      <Check className="h-3.5 w-3.5 text-[#1f5c45]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedField === "negative" ? "Copied" : "Copy"}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={2}
                  value={photoNegative}
                  className={`${field} mt-0 resize-y bg-white font-mono text-xs leading-relaxed`}
                />
              </div>
            )}
            <p className="text-xs text-stone-500">
              Paste into Gemini / Midjourney / similar, generate the photo, then
              upload it as the cover above.
            </p>
          </div>
        )}

        {imageMode === "upload" ? (
          image ? (
            <div className="relative overflow-hidden rounded-2xl border border-[#d8e0d6] bg-[#f3f6f2]">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={image}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 800px"
                />
              </div>
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => coverRef.current?.click()}
                  disabled={uploadingCover}
                  className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0f2a22] shadow-sm hover:bg-white"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm hover:bg-white"
                  aria-label="Remove cover"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Cover
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={uploadingCover}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b7c7b4] bg-[#f8faf7] px-6 py-12 text-sm text-[#0f2a22] transition hover:border-[#1f5c45]/40 hover:bg-[#f3f6f2] disabled:opacity-60"
            >
              {uploadingCover ? (
                <Loader2 className="h-7 w-7 animate-spin text-[#1f5c45]" />
              ) : (
                <ImagePlus className="h-7 w-7 text-[#1f5c45]" />
              )}
              <span className="font-semibold">
                {uploadingCover ? "Uploading cover…" : "Upload cover image"}
              </span>
              <span className="text-xs text-stone-500">JPG, PNG, or WebP · max 5MB</span>
            </button>
          )
        ) : (
          <label className={labelCls}>
            Cover image URL
            <input
              value={image}
              onChange={(e) => {
                const url = e.target.value;
                setImage(url);
                if (url.trim()) addToGallery(url.trim());
              }}
              className={field}
              placeholder="https://…"
            />
          </label>
        )}

        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadCover(e.target.files)}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadGallery(e.target.files)}
        />

        {gallery.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#0f2a22]">
              Gallery ({gallery.length})
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((url) => {
                const isCover = url === image;
                return (
                  <div
                    key={url}
                    className={`group relative overflow-hidden rounded-xl border bg-[#f8faf7] ${
                      isCover
                        ? "border-[#1f5c45] ring-2 ring-[#1f5c45]/25"
                        : "border-[#d8e0d6]"
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      {isCover ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#1f5c45]">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setImage(url)}
                          className="text-left text-[11px] font-semibold text-[#1f5c45] hover:underline"
                        >
                          Set as cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => insertImageIntoBody(url)}
                        className="text-left text-[11px] font-semibold text-[#0f2a22] hover:underline"
                      >
                        Insert in article
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(url)}
                        className="text-left text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
            Content
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Use the toolbar for headings, bold, lists, links, and inline photos.
          </p>
        </div>
        <BlogRichEditor
          value={body}
          onChange={onBodyChange}
          disabled={loading || aiLoading}
          imageNameHint={blogImageNameHint()}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <label className="flex items-center gap-2 text-sm font-medium text-[#0f2a22]">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-[#d8e0d6] text-[#1f5c45] focus:ring-[#1f5c45]"
          />
          Publish on the website
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="rounded-xl border border-[#d8e0d6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a22] hover:bg-[#f3f6f2]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingCover || uploadingGallery || aiLoading || photoPromptLoading}
            className="rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
          >
            {loading ? "Saving…" : isEdit ? "Update post" : "Create post"}
          </button>
        </div>
      </section>
    </form>
  );
}
