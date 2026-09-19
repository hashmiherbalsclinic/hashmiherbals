"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  ImagePlus,
  Link2,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  slugify,
  type ProductFaqRow,
  type ProductRow,
  type ProductWeightRow,
} from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";
import { revalidateProductsCache } from "@/lib/admin/actions";
import { generateProductDraft } from "@/lib/admin/product-generate";
import { generateProductPhotoPrompt } from "@/lib/admin/product-photo-prompt";
import { prepareProductWebpUpload } from "@/lib/admin/to-webp";
import { toUserFacingError } from "@/lib/errors/user-message";
import { ErrorAlert } from "@/components/errors/ErrorAlert";

const field =
  "mt-1.5 w-full rounded-xl border border-[#d8e0d6] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#74a13a] focus:ring-2 focus:ring-[#74a13a]/25";
const labelCls = "block text-sm font-medium text-[#0f2a22]";
const sectionTitle =
  "text-xs font-bold uppercase tracking-[0.14em] text-[#1f4d3a]";

type WeightDraft = {
  value: string;
  unit: "g" | "kg";
  price: string;
  compare_at: string;
};

type Props = {
  product?: ProductRow | null;
};

function linesToList(value: string) {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(list?: string[] | null) {
  return (list ?? []).join("\n");
}

function weightsFromProduct(product?: ProductRow | null): WeightDraft[] {
  if (product?.weights?.length) {
    return product.weights.map((w) => ({
      value: String(w.value ?? ""),
      unit: w.unit === "kg" ? "kg" : "g",
      price: String(w.price ?? ""),
      compare_at: w.compare_at != null ? String(w.compare_at) : "",
    }));
  }
  if (product?.price != null) {
    return [
      {
        value: "100",
        unit: "g",
        price: String(product.price),
        compare_at: product.compare_at != null ? String(product.compare_at) : "",
      },
    ];
  }
  return [{ value: "", unit: "g", price: "", compare_at: "" }];
}

function parseWeights(drafts: WeightDraft[]): ProductWeightRow[] {
  return drafts
    .map((w) => ({
      value: Number(w.value),
      unit: w.unit,
      price: Number(w.price),
      compare_at: w.compare_at.trim() ? Number(w.compare_at) : null,
    }))
    .filter((w) => w.value > 0 && w.price >= 0)
    .sort((a, b) => {
      const ag = a.unit === "kg" ? a.value * 1000 : a.value;
      const bg = b.unit === "kg" ? b.value * 1000 : b.value;
      return ag - bg;
    });
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const primaryRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [description, setDescription] = useState(product?.description ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [tasteNote, setTasteNote] = useState(product?.taste_note ?? "");
  const [weights, setWeights] = useState<WeightDraft[]>(() =>
    weightsFromProduct(product)
  );
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [rating, setRating] = useState(String(product?.rating ?? 5));
  const [reviews, setReviews] = useState(String(product?.reviews ?? 0));
  const [category, setCategory] = useState(
    product?.category ?? PRODUCT_CATEGORIES[0]
  );
  const [image, setImage] = useState(product?.image ?? "");
  const [images, setImages] = useState<string[]>(
    product?.images?.length
      ? product.images
      : product?.image
        ? [product.image]
        : []
  );
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [benefits, setBenefits] = useState(listToLines(product?.benefits));
  const [ingredients, setIngredients] = useState(
    listToLines(product?.ingredients)
  );
  const [howToUse, setHowToUse] = useState(listToLines(product?.how_to_use));
  const [highlights, setHighlights] = useState(
    listToLines(product?.highlights)
  );
  const [faqs, setFaqs] = useState<ProductFaqRow[]>(
    product?.faqs?.length
      ? product.faqs
      : [
          {
            q: "How long does one pack typically last?",
            a: "",
          },
          {
            q: "Are there any known side effects?",
            a: "",
          },
          {
            q: "Can I combine this with other herbal remedies?",
            a: "",
          },
          {
            q: "How should I store this product?",
            a: "",
          },
        ]
  );
  const [active, setActive] = useState(product?.active ?? true);
  const [bestseller, setBestseller] = useState(product?.bestseller ?? false);
  const [newArrival, setNewArrival] = useState(product?.new_arrival ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [aiName, setAiName] = useState(product?.title ?? "");
  const [aiNotes, setAiNotes] = useState("");
  const [aiLanguage, setAiLanguage] = useState<"en" | "ur">("en");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [photoPromptLoading, setPhotoPromptLoading] = useState(false);
  const [photoPrompt, setPhotoPrompt] = useState<string | null>(null);
  const [photoNegative, setPhotoNegative] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"prompt" | "negative" | null>(
    null
  );

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function productImageNameHint() {
    return slug.trim() || title.trim() || aiName.trim() || "product";
  }

  function addToGallery(url: string) {
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  }

  async function uploadImageFile(file: File, role: "primary" | "gallery") {
    const { file: webp, storagePath } = await prepareProductWebpUpload(file, {
      nameHint: productImageNameHint(),
      role,
      index: role === "gallery" ? images.length + 1 : undefined,
    });
    const supabase = createClient();
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(storagePath, webp, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/webp",
      });
    if (upErr) throw upErr;
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);
    return data.publicUrl;
  }

  async function onGenerateAi() {
    setError(null);
    setAiMessage(null);
    const name = aiName.trim() || title.trim();
    if (name.length < 2) {
      setError("Enter a product name for the AI bot (or fill Title first).");
      return;
    }

    const hasCopy =
      Boolean(description.trim()) ||
      Boolean(benefits.trim()) ||
      Boolean(howToUse.trim()) ||
      faqs.some((f) => f.a.trim());
    if (
      hasCopy &&
      !window.confirm(
        "AI will replace title, description, category, benefits, ingredients, how-to-use, highlights, and FAQs. Weights and prices stay as you set them. Continue?"
      )
    ) {
      return;
    }

    setAiLoading(true);
    try {
      const result = await generateProductDraft({
        productName: name,
        notes: aiNotes,
        language: aiLanguage,
        categoryHint: category,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      onTitleChange(result.title);
      setTagline(result.tagline);
      setDescription(result.description);
      setCategory(result.category);
      setTasteNote(result.tasteNote);
      setBenefits(result.benefits.join("\n"));
      setIngredients(result.ingredients.join("\n"));
      setHowToUse(result.howToUse.join("\n"));
      setHighlights(result.highlights.join("\n"));
      setFaqs(
        result.faqs.length
          ? result.faqs
          : [
              { q: "How long does one pack typically last?", a: "" },
              { q: "Are there any known side effects?", a: "" },
              { q: "Can I combine this with other herbal remedies?", a: "" },
              { q: "How should I store this product?", a: "" },
            ]
      );
      setAiMessage(
        `Details filled${result.modelId ? ` (${result.modelId})` : ""}. Add pack weights and PKR prices yourself, then upload images and save.`
      );
    } catch (err) {
      setError(toUserFacingError(err, "admin"));
    } finally {
      setAiLoading(false);
    }
  }

  async function onGeneratePhotoPrompt() {
    setError(null);
    setAiMessage(null);

    const nameForImage =
      aiName.trim() || title.trim() || tagline.trim() || description.trim();
    if (!nameForImage) {
      setError(
        "Enter a product name or title first so the photo prompt matches the product."
      );
      return;
    }

    setPhotoPromptLoading(true);
    try {
      const result = await generateProductPhotoPrompt({
        productName: nameForImage,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        tagline: tagline.trim() || undefined,
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
        `Ultra-realistic product photo prompt ready${result.modelId ? ` (${result.modelId})` : ""} — copy it into Gemini / Midjourney, then upload the result here.`
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
      setError("Could not copy to clipboard.");
    }
  }

  function setPrimary(url: string) {
    setImage(url);
    setImages((prev) => {
      const rest = prev.filter((u) => u !== url);
      return [url, ...rest];
    });
  }

  function removeImage(url: string) {
    setImages((prev) => {
      const next = prev.filter((u) => u !== url);
      if (image === url) setImage(next[0] ?? "");
      return next;
    });
  }

  async function uploadPrimary(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploadingPrimary(true);
    try {
      const url = await uploadImageFile(files[0], "primary");
      setImage(url);
      addToGallery(url);
    } catch (err) {
      setError(toUserFacingError(err, "admin"));
    } finally {
      setUploadingPrimary(false);
      if (primaryRef.current) primaryRef.current.value = "";
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
      setImages((prev) => {
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!image && images.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    const parsedWeights = parseWeights(weights);
    if (!parsedWeights.length) {
      setError("Add at least one item weight with a price.");
      return;
    }

    setLoading(true);
    const primary = image || images[0];
    const gallery = [primary, ...images.filter((u) => u !== primary)];
    const base = parsedWeights[0];

    const payload = {
      title: title.trim(),
      slug: slugify(slug || title),
      description: description.trim(),
      price: base.price,
      compare_at: base.compare_at,
      stock: Number(stock) || 0,
      category,
      image: primary,
      images: gallery,
      benefits: linesToList(benefits),
      tagline: tagline.trim() || null,
      taste_note: tasteNote.trim() || null,
      ingredients: linesToList(ingredients),
      how_to_use: linesToList(howToUse),
      highlights: linesToList(highlights),
      faqs: faqs
        .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
        .filter((f) => f.q && f.a),
      weights: parsedWeights,
      rating: Number(rating) || 5,
      reviews: Number(reviews) || 0,
      active,
      bestseller,
      new_arrival: newArrival,
      featured,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (isEdit && product) {
      const { error: err } = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id);
      setLoading(false);
      if (err) {
        setError(toUserFacingError(err.message, "admin"));
        return;
      }
    } else {
      const { error: err } = await supabase.from("products").insert(payload);
      setLoading(false);
      if (err) {
        setError(toUserFacingError(err.message, "admin"));
        return;
      }
    }

    await revalidateProductsCache();
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-4xl space-y-8 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-8"
    >
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
              AI product bot
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#0f2a22]">
              Generate details with Gemini
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Fills title, description, category, benefits, ingredients, directions,
              and FAQs. You add pack weights, PKR prices, stock, and images.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f5c45]/10 px-2.5 py-1 text-xs font-semibold text-[#1f5c45]">
            <Sparkles className="h-3.5 w-3.5" />
            Gemini Flash-Lite
          </span>
        </div>

        <label className={labelCls}>
          Product name
          <input
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
            className={field}
            placeholder="e.g. Kalonji Oil, Majoon Mubahi, Pure Salajeet"
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
            placeholder="Cold-pressed, for hair, Unani tonic, women’s care…"
            disabled={aiLoading || loading}
          />
        </label>

        <label className={`${labelCls} max-w-xs`}>
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

        <button
          type="button"
          onClick={onGenerateAi}
          disabled={aiLoading || loading || uploadingPrimary || uploadingGallery}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
        >
          {aiLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating details…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate &amp; insert into form
            </>
          )}
        </button>
      </section>

      {/* Basics */}
      <section className="space-y-4">
        <p className={sectionTitle}>Basics</p>
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
          Short summary (shown under title)
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={field}
            placeholder="One-line claim - e.g. Traditional Unani tonic for daily vitality"
          />
        </label>
        <label className={labelCls}>
          Product description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={field}
            placeholder="2 short sentences: what the product is, and its main traditional use."
          />
          <span className="mt-1 block text-xs text-muted">
            Used as the short description on the minimalist product page (first 1–2 sentences).
          </span>
        </label>
      </section>

      {/* Images */}
      <section className="space-y-4 rounded-2xl border border-[#d8e0d6] bg-[#fafaf8] p-5 sm:p-6">
        <div>
          <p className={sectionTitle}>Product images</p>
          <h2 className="mt-1 text-lg font-bold text-[#0f2a22]">Primary &amp; gallery</h2>
          <p className="mt-1 text-sm text-stone-500">
            JPG/PNG uploads convert to WebP and rename from the product slug
            (e.g. kalonji-oil-primary-….webp). Photos show full-bleed on the shop
            (edge-to-edge). Paste a URL, add gallery photos, or get an
            ultra-realistic product photo prompt.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setImageMode("upload")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              imageMode === "upload"
                ? "bg-[#1f5c45] text-white"
                : "bg-white text-[#0f2a22] hover:bg-[#e8eee6]"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload primary
          </button>
          <button
            type="button"
            onClick={() => setImageMode("url")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              imageMode === "url"
                ? "bg-[#1f5c45] text-white"
                : "bg-white text-[#0f2a22] hover:bg-[#e8eee6]"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            Primary from URL
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploadingGallery || loading || photoPromptLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#0f2a22] transition hover:bg-[#e8eee6] disabled:opacity-60"
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
              photoPromptLoading ||
              loading ||
              uploadingPrimary ||
              uploadingGallery
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
              upload it as the primary image above.
            </p>
          </div>
        )}

        {imageMode === "upload" ? (
          image ? (
            <div className="relative overflow-hidden rounded-2xl border border-[#d8e0d6] bg-white">
              <div className="relative aspect-square max-w-sm">
                <Image
                  src={image}
                  alt="Primary preview"
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 360px"
                />
              </div>
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => primaryRef.current?.click()}
                  disabled={uploadingPrimary}
                  className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0f2a22] shadow-sm hover:bg-white"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm hover:bg-white"
                  aria-label="Remove primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Primary
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => primaryRef.current?.click()}
              disabled={uploadingPrimary}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b7c7b4] bg-white px-6 py-12 text-sm text-[#0f2a22] transition hover:border-[#1f5c45]/40 hover:bg-[#f3f6f2] disabled:opacity-60"
            >
              {uploadingPrimary ? (
                <Loader2 className="h-7 w-7 animate-spin text-[#1f5c45]" />
              ) : (
                <ImagePlus className="h-7 w-7 text-[#1f5c45]" />
              )}
              <span className="font-semibold">
                {uploadingPrimary ? "Uploading primary…" : "Upload primary image"}
              </span>
              <span className="text-xs text-stone-500">JPG, PNG, or WebP · max 5MB</span>
            </button>
          )
        ) : (
          <label className={labelCls}>
            Primary image URL
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
          ref={primaryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadPrimary(e.target.files)}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadGallery(e.target.files)}
        />

        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#0f2a22]">
              Gallery ({images.length})
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((url) => {
                const isPrimary = url === (image || images[0]);
                return (
                  <div
                    key={url}
                    className={`group relative overflow-hidden rounded-xl border bg-white ${
                      isPrimary
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
                      {isPrimary ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#1f5c45]">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimary(url)}
                          className="text-left text-[11px] font-semibold text-[#1f5c45] hover:underline"
                        >
                          Set as primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="text-left text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={uploadingGallery}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#d8e0d6] bg-white text-[#1f4d3a] transition hover:border-[#1f5c45]/40 hover:bg-[#f3f6f2] disabled:opacity-60"
              >
                <ImagePlus className="h-6 w-6 opacity-50" />
                <span className="text-xs font-semibold">Add more</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Pricing & weights */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={sectionTitle}>Item weights & pricing</p>
            <p className="mt-1 text-xs text-muted">
              Add every pack size (g or kg) with its own price. These appear as size options on the product page.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setWeights((list) => [
                ...list,
                { value: "", unit: "g", price: "", compare_at: "" },
              ])
            }
            className="text-sm font-semibold text-[#1f5c45] hover:underline"
          >
            + Add weight
          </button>
        </div>

        <div className="space-y-3">
          {weights.map((w, i) => (
            <div
              key={i}
              className="relative grid gap-3 rounded-xl border border-[#d8e0d6] bg-[#fafaf8] p-4 sm:grid-cols-[1fr_7rem_1fr_1fr_auto]"
            >
              <label className={labelCls}>
                Weight
                <input
                  required
                  type="number"
                  min={0.01}
                  step="any"
                  value={w.value}
                  onChange={(e) =>
                    setWeights((list) =>
                      list.map((item, idx) =>
                        idx === i ? { ...item, value: e.target.value } : item
                      )
                    )
                  }
                  className={field}
                  placeholder="100"
                />
              </label>
              <label className={labelCls}>
                Unit
                <select
                  value={w.unit}
                  onChange={(e) =>
                    setWeights((list) =>
                      list.map((item, idx) =>
                        idx === i
                          ? {
                              ...item,
                              unit: e.target.value === "kg" ? "kg" : "g",
                            }
                          : item
                      )
                    )
                  }
                  className={field}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </label>
              <label className={labelCls}>
                Price (PKR)
                <input
                  required
                  type="number"
                  min={0}
                  value={w.price}
                  onChange={(e) =>
                    setWeights((list) =>
                      list.map((item, idx) =>
                        idx === i ? { ...item, price: e.target.value } : item
                      )
                    )
                  }
                  className={field}
                />
              </label>
              <label className={labelCls}>
                Compare at
                <input
                  type="number"
                  min={0}
                  value={w.compare_at}
                  onChange={(e) =>
                    setWeights((list) =>
                      list.map((item, idx) =>
                        idx === i
                          ? { ...item, compare_at: e.target.value }
                          : item
                      )
                    )
                  }
                  className={field}
                  placeholder="Optional"
                />
              </label>
              {weights.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setWeights((list) => list.filter((_, idx) => idx !== i))
                  }
                  className="self-end rounded-xl border border-[#d8e0d6] bg-white p-2.5 text-rose-600 hover:bg-rose-50"
                  aria-label="Remove weight"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelCls}>
            Stock
            <input
              required
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={field}
            />
          </label>
          <label className={labelCls}>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={field}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            Rating
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={field}
            />
          </label>
        </div>
        <label className={`${labelCls} max-w-xs`}>
          Reviews count
          <input
            type="number"
            min={0}
            value={reviews}
            onChange={(e) => setReviews(e.target.value)}
            className={field}
          />
        </label>
      </section>

      {/* Product page content - matches storefront PDP */}
      <section className="space-y-4">
        <div>
          <p className={sectionTitle}>Product page content</p>
          <p className="mt-1 text-xs text-muted">
            These sections power the storefront product page: Key Benefits, Dosage &amp; Directions,
            and FAQs. One item per line for lists.
          </p>
        </div>
        <label className={labelCls}>
          Key Benefits &amp; Uses
          <textarea
            rows={4}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            className={field}
            placeholder={
              "Pure natural formulation without synthetic additives.\nTraditional Unani recipe prepared under expert supervision.\nClear usage instructions for daily routines.\nCarefully sourced botanicals for optimal purity."
            }
          />
          <span className="mt-1 block text-xs text-muted">
            Aim for 4 concise benefits (shown in a 2-column checklist).
          </span>
        </label>
        <label className={labelCls}>
          Suggested Dosage &amp; Directions
          <textarea
            rows={3}
            value={howToUse}
            onChange={(e) => setHowToUse(e.target.value)}
            className={field}
            placeholder={
              "Take the suggested amount once or twice daily, or as advised.\nUse consistently with water or warm milk as preferred.\nStore sealed in a cool, dry place after each use."
            }
          />
          <span className="mt-1 block text-xs text-muted">
            Prefer 3 short numbered steps for the dosage card.
          </span>
        </label>
        <details className="rounded-xl border border-[#d8e0d6] bg-[#fafaf8] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#1f4d3a]">
            Optional: ingredients &amp; notes
          </summary>
          <div className="mt-3 space-y-3">
            <label className={labelCls}>
              Ingredients
              <textarea
                rows={3}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className={field}
                placeholder={"100% cold-pressed black seed oil\nNo added fragrance"}
              />
            </label>
            <label className={labelCls}>
              Taste / sensory note
              <input
                value={tasteNote}
                onChange={(e) => setTasteNote(e.target.value)}
                className={field}
                placeholder="e.g. Earthy & peppery aroma · Cold-pressed"
              />
            </label>
            <label className={labelCls}>
              Internal highlights (not shown on new PDP)
              <textarea
                rows={3}
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                className={field}
                placeholder="Optional notes kept for admin reference"
              />
            </label>
          </div>
        </details>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={sectionTitle}>Frequently Asked Questions</p>
            <p className="mt-1 text-xs text-muted">
              Collapsible FAQs on the product page. Prefills common questions for new products.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFaqs((f) => [...f, { q: "", a: "" }])}
            className="text-sm font-semibold text-[#1f5c45] hover:underline"
          >
            + Add FAQ
          </button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="relative space-y-2 rounded-xl border border-[#d8e0d6] bg-[#fafaf8] p-4"
            >
              {faqs.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFaqs((list) => list.filter((_, idx) => idx !== i))}
                  className="absolute right-3 top-3 rounded-full p-1 text-muted hover:bg-white hover:text-ink"
                  aria-label="Remove FAQ"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <label className={labelCls}>
                Question
                <input
                  value={faq.q}
                  onChange={(e) =>
                    setFaqs((list) =>
                      list.map((item, idx) =>
                        idx === i ? { ...item, q: e.target.value } : item
                      )
                    )
                  }
                  className={field}
                  placeholder="e.g. How long does one pack typically last?"
                />
              </label>
              <label className={labelCls}>
                Answer
                <textarea
                  rows={2}
                  value={faq.a}
                  onChange={(e) =>
                    setFaqs((list) =>
                      list.map((item, idx) =>
                        idx === i ? { ...item, a: e.target.value } : item
                      )
                    )
                  }
                  className={field}
                  placeholder="Answer shown when customers expand this FAQ"
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Flags */}
      <div className="flex flex-wrap gap-5 rounded-xl bg-[#f3f6f2] px-4 py-3">
        {(
          [
            ["Active", active, setActive],
            ["Featured", featured, setFeatured],
            ["Bestseller", bestseller, setBestseller],
            ["New arrival", newArrival, setNewArrival],
          ] as const
        ).map(([label, checked, set]) => (
          <label
            key={label}
            className="flex items-center gap-2 text-sm font-medium text-[#0f2a22]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => set(e.target.checked)}
              className="h-4 w-4 rounded border-[#d8e0d6] text-[#74a13a] focus:ring-[#74a13a]"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploadingPrimary || uploadingGallery || aiLoading || photoPromptLoading}
          className="rounded-xl bg-[#1f5c45] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Update product" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-xl border border-[#d8e0d6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a22] hover:bg-[#f3f6f2]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
