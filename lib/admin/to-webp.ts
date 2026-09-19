/** Client-side image → WebP conversion (browser Canvas). */

export type ToWebpOptions = {
  /** 0–1, default 0.82 */
  quality?: number;
  /** Max longest edge in px; keeps aspect ratio. Default 2400. */
  maxEdge?: number;
  /** Final filename without extension (sanitized). */
  fileName?: string;
};

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("WebP conversion failed."));
        else resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

/** Safe filename stem: lowercase, hyphens, no extension. */
export function imageFileStem(input: string, fallback = "blog-image") {
  const stem = input
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return stem || fallback;
}

function shortId() {
  return Math.random().toString(36).slice(2, 8);
}

/** Convert any browser-decodable image File/Blob into a WebP File. */
export async function fileToWebp(
  file: File | Blob,
  options: ToWebpOptions = {}
): Promise<File> {
  const quality = options.quality ?? 0.82;
  const maxEdge = options.maxEdge ?? 2400;

  const img = await loadImage(file);
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (!width || !height) {
    throw new Error("Invalid image dimensions.");
  }

  const longest = Math.max(width, height);
  if (longest > maxEdge) {
    const scale = maxEdge / longest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");

  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToWebpBlob(canvas, quality);

  const baseName = imageFileStem(
    options.fileName ||
      (file instanceof File ? file.name : "") ||
      "image"
  );

  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

/**
 * Blog upload helper:
 * - If not WebP → convert to WebP
 * - If already WebP → keep bytes, only rename
 * - Always applies a clean slug-based filename
 */
export async function prepareBlogWebpUpload(
  file: File,
  options: {
    /** From post slug / title / topic */
    nameHint: string;
    role: "cover" | "gallery" | "inline";
    index?: number;
  }
): Promise<{ file: File; storagePath: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Each image must be under 8MB before conversion.");
  }

  const base = imageFileStem(options.nameHint, "blog");
  const rolePart =
    options.index != null
      ? `${options.role}-${options.index}`
      : options.role;
  const fileName = `${base}-${rolePart}-${shortId()}`;

  let webp: File;
  const isWebp =
    file.type === "image/webp" || /\.webp$/i.test(file.name);

  if (isWebp) {
    webp = new File([file], `${fileName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } else {
    webp = await fileToWebp(file, { fileName });
  }

  if (webp.size > 5 * 1024 * 1024) {
    throw new Error("WebP file is over 5MB — try a smaller source image.");
  }

  const folder =
    options.role === "cover"
      ? "covers"
      : options.role === "gallery"
        ? "gallery"
        : "inline";

  return {
    file: webp,
    storagePath: `${folder}/${fileName}.webp`,
  };
}

/**
 * Product upload helper (same WebP + slug rename behavior as blogs).
 */
export async function prepareProductWebpUpload(
  file: File,
  options: {
    nameHint: string;
    role: "primary" | "gallery";
    index?: number;
  }
): Promise<{ file: File; storagePath: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Each image must be under 8MB before conversion.");
  }

  const base = imageFileStem(options.nameHint, "product");
  const rolePart =
    options.index != null
      ? `${options.role}-${options.index}`
      : options.role;
  const fileName = `${base}-${rolePart}-${shortId()}`;

  let webp: File;
  const isWebp =
    file.type === "image/webp" || /\.webp$/i.test(file.name);

  if (isWebp) {
    webp = new File([file], `${fileName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } else {
    webp = await fileToWebp(file, { fileName });
  }

  if (webp.size > 5 * 1024 * 1024) {
    throw new Error("WebP file is over 5MB — try a smaller source image.");
  }

  const folder = options.role === "primary" ? "primary" : "gallery";

  return {
    file: webp,
    storagePath: `${folder}/${fileName}.webp`,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
