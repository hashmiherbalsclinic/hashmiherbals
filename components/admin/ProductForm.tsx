"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  slugify,
  type ProductFaqRow,
  type ProductRow,
  type ProductWeightRow,
} from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";

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
  const fileRef = useRef<HTMLInputElement>(null);

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
  const [uploading, setUploading] = useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
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

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be under 5MB.");
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length) {
        setImages((prev) => {
          const next = [...prev, ...uploaded];
          if (!image) setImage(uploaded[0]);
          return next;
        });
        if (!image && uploaded[0]) setImage(uploaded[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
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
        setError(err.message);
        return;
      }
    } else {
      const { error: err } = await supabase.from("products").insert(payload);
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-4xl space-y-8 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-8"
    >
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

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
            placeholder="One-line claim — e.g. Traditional Unani tonic for daily vitality"
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
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={sectionTitle}>Product images</p>
            <p className="mt-1 text-xs text-muted">
              First / primary image is shown in the product hero. Extra images are optional.
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f5c45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
          >
            {uploading ? (
              "Uploading…"
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload images
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>

        {images.length === 0 ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#1f5c45]/25 bg-[#f3f6f2] px-6 py-14 text-sm text-[#1f4d3a] transition hover:border-[#1f5c45]/50"
          >
            <ImagePlus className="h-8 w-8 opacity-60" />
            Click to upload product photos
            <span className="text-xs text-muted">JPG, PNG, or WebP · max 5MB each</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((url) => {
              const isPrimary = url === (image || images[0]);
              return (
                <div
                  key={url}
                  className={`group relative aspect-square overflow-hidden rounded-xl border bg-[#f6f4ef] ${
                    isPrimary ? "border-[#1f5c45] ring-2 ring-[#1f5c45]/30" : "border-[#d8e0d6]"
                  }`}
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="180px" />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(url)}
                        className="flex-1 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0f2a22]"
                      >
                        Primary
                      </button>
                    )}
                    {isPrimary && (
                      <span className="flex-1 rounded-lg bg-[#74a13a] px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="rounded-lg bg-white/95 p-1.5 text-rose-600"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#d8e0d6] text-[#1f4d3a] transition hover:border-[#1f5c45]/40 hover:bg-[#f3f6f2]"
            >
              <ImagePlus className="h-6 w-6 opacity-50" />
              <span className="text-xs font-semibold">Add more</span>
            </button>
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

      {/* Product page content — matches storefront PDP */}
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
          disabled={loading || uploading}
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
