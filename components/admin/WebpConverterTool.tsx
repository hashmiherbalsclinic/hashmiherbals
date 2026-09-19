"use client";

import { useRef, useState } from "react";
import { Check, Download, ImagePlus, Loader2, X } from "lucide-react";
import { fileToWebp, formatBytes } from "@/lib/admin/to-webp";

type Item = {
  id: string;
  name: string;
  originalSize: number;
  webp?: File;
  webpSize?: number;
  previewUrl?: string;
  error?: string;
};

export function WebpConverterTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(0.82);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);

    const next: Item[] = [];
    try {
      for (const file of Array.from(files)) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        if (!file.type.startsWith("image/")) {
          next.push({
            id,
            name: file.name,
            originalSize: file.size,
            error: "Not an image file",
          });
          continue;
        }
        try {
          const webp = await fileToWebp(file, { quality });
          next.push({
            id,
            name: file.name,
            originalSize: file.size,
            webp,
            webpSize: webp.size,
            previewUrl: URL.createObjectURL(webp),
          });
        } catch (err) {
          next.push({
            id,
            name: file.name,
            originalSize: file.size,
            error: err instanceof Error ? err.message : "Conversion failed",
          });
        }
      }
      setItems((prev) => {
        prev.forEach((p) => {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        });
        return next;
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function downloadOne(item: Item) {
    if (!item.webp || !item.previewUrl) return;
    const a = document.createElement("a");
    a.href = item.previewUrl;
    a.download = item.webp.name;
    a.click();
  }

  function downloadAll() {
    items.forEach((item) => {
      if (item.webp) downloadOne(item);
    });
  }

  function clearAll() {
    items.forEach((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    });
    setItems([]);
  }

  const okCount = items.filter((i) => i.webp).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="space-y-4 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
            Tools
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#0f2a22]">
            Convert images to WebP
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Shrink JPG/PNG (and other images) to WebP for faster pages. Blog and
            product uploads already convert automatically — use this for batch
            downloads.
          </p>
        </div>

        <label className="block text-sm font-medium text-[#0f2a22]">
          Quality ({Math.round(quality * 100)}%)
          <input
            type="range"
            min={0.5}
            max={0.95}
            step={0.01}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="mt-2 w-full accent-[#1f5c45]"
            disabled={busy}
          />
          <span className="mt-1 block text-xs text-stone-500">
            Higher = better detail, larger file. 80–85% is a solid default.
          </span>
        </label>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b7c7b4] bg-[#f8faf7] px-6 py-12 text-sm text-[#0f2a22] transition hover:border-[#1f5c45]/40 hover:bg-[#f3f6f2] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-[#1f5c45]" />
          ) : (
            <ImagePlus className="h-7 w-7 text-[#1f5c45]" />
          )}
          <span className="font-semibold">
            {busy ? "Converting…" : "Choose images"}
          </span>
          <span className="text-xs text-stone-500">
            Multiple files OK · max edge 2400px
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
        />

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
      </section>

      {items.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-[#d8e0d6] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#0f2a22]">
              {okCount} ready · {items.length} total
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadAll}
                disabled={!okCount}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1f5c45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174a37] disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Download all WebP
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e0d6] bg-white px-4 py-2 text-sm font-semibold text-[#0f2a22] hover:bg-[#f3f6f2]"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          <ul className="divide-y divide-[#e8eee6] rounded-xl border border-[#d8e0d6]">
            {items.map((item) => {
              const saved =
                item.webpSize != null
                  ? Math.max(
                      0,
                      Math.round(
                        (1 - item.webpSize / item.originalSize) * 100
                      )
                    )
                  : null;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
                >
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <X className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0f2a22]">
                      {item.name}
                    </p>
                    {item.error ? (
                      <p className="text-xs text-rose-600">{item.error}</p>
                    ) : (
                      <p className="text-xs text-stone-500">
                        {formatBytes(item.originalSize)} →{" "}
                        {formatBytes(item.webpSize ?? 0)}
                        {saved != null ? ` · saved ${saved}%` : ""}
                      </p>
                    )}
                  </div>
                  {item.webp && (
                    <button
                      type="button"
                      onClick={() => downloadOne(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#d8e0d6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f5c45] hover:bg-[#f3f6f2]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Download
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
