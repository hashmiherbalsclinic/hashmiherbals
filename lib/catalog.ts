export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Hashmi Herbals",
  tagline: "Traditional & Organic",
  description:
    "Authentic Unani oils, majoons, powders, and salajeet for Pakistani homes. Cash on Delivery nationwide.",
  /** Orders & general queries */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP?.trim() || "923234992614",
  phone: process.env.NEXT_PUBLIC_PHONE?.trim() || "+92 323 4992614",
  phoneLabel: "Orders & queries",
  /** Practitioner direct line (About page) */
  hakeemPhone: process.env.NEXT_PUBLIC_HAKEEM_PHONE?.trim() || "+92 300 4700279",
  hakeemPhoneRaw: process.env.NEXT_PUBLIC_HAKEEM_PHONE_RAW?.trim() || "03004700279",
  hakeemName: process.env.NEXT_PUBLIC_HAKEEM_NAME?.trim() || "Syed Mubashar Akhtar Hashmi",
  email: "info@hashmiherbals.com",
  /** Clinic address shown on Contact */
  address: "Hashmi Herbal Clinic & store",
  addressDetail: "Lahore, Pakistan",
  /** Used for Google Maps search / embed fallback */
  mapsQuery: "Hashmi Herbal Clinic & store",
  /** Official Google Maps embed for clinic pin */
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1701.4029298498162!2d74.28785771288385!3d31.474526259601415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190355149c44a1%3A0xb43b459d1e24f93f!2sHashmi%20Herbal%20Clinic%20%26%20store!5e0!3m2!1sen!2s!4v1789664414576!5m2!1sen!2s",
  /** Direct Google Maps place link */
  mapsUrl:
    "https://www.google.com/maps/place/Hashmi+Herbal+Clinic+%26+store/@31.4745263,74.2888577,17z/data=!3m1!4b1!4m6!3m5!1s0x39190355149c44a1:0xb43b459d1e24f93f!8m2!3d31.4745263!4d74.2888577",
  freeShippingMin: 2000,
  shippingFee: 200,
};

export type CategoryId =
  | "mens-care"
  | "womens-care"
  | "majoon"
  | "oils"
  | "powders"
  | "salajeet"
  | "digestion"
  | "seeds";

export type ProductFaq = { q: string; a: string };

/** Pack sizes - product.price is the 100 g base price when using multipliers */
export type ProductSize = {
  id: string;
  label: string;
  grams: number;
  unit: "g" | "kg";
  /** Absolute price for this pack (preferred when set from admin) */
  price?: number;
  compareAt?: number;
  /** Multiplier vs product.price — used only when price is omitted */
  multiplier?: number;
};

export const defaultProductSizes: ProductSize[] = [
  { id: "50g", label: "50 g", grams: 50, unit: "g", multiplier: 0.55 },
  { id: "100g", label: "100 g", grams: 100, unit: "g", multiplier: 1 },
  { id: "200g", label: "200 g", grams: 200, unit: "g", multiplier: 1.85 },
  { id: "500g", label: "500 g", grams: 500, unit: "g", multiplier: 4.2 },
];

export function priceForSize(basePrice: number, size: ProductSize) {
  if (typeof size.price === "number") return Math.round(size.price);
  return Math.round(basePrice * (size.multiplier ?? 1));
}

export function compareAtForSize(baseCompareAt: number | undefined, size: ProductSize) {
  if (typeof size.compareAt === "number") return Math.round(size.compareAt);
  if (baseCompareAt == null) return undefined;
  if (typeof size.price === "number" && size.multiplier == null) return undefined;
  return Math.round(baseCompareAt * (size.multiplier ?? 1));
}

export function getDefaultSize(sizes?: ProductSize[]) {
  if (sizes?.length) {
    return (
      sizes.find((s) => s.id === "100g") ??
      sizes.find((s) => s.grams === 100) ??
      sizes[0]
    );
  }
  return defaultProductSizes.find((s) => s.id === "100g") ?? defaultProductSizes[1];
}

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  benefits: string[];
  /** Base price for 100 g pack */
  price: number;
  compareAt?: number;
  stock: number;
  category: CategoryId;
  image: string;
  /** Extra gallery images (product.image is always first) */
  images?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  rating: number;
  reviews: number;
  /** Short claim under the title */
  tagline?: string;
  /** Taste / sensory note */
  tasteNote?: string;
  ingredients?: string[];
  howToUse?: string[];
  highlights?: string[];
  faqs?: ProductFaq[];
  /** Override pack sizes; defaults to 50/100/200/500 g */
  sizes?: ProductSize[];
};

export type Category = {
  id: CategoryId;
  slug: CategoryId;
  name: string;
  blurb: string;
  href: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: "mens-care",
    slug: "mens-care",
    name: "Men's Care",
    blurb: "Vitality & strength",
    href: "/shop?category=mens-care",
    image: "/images/categories/mens-care.webp",
  },
  {
    id: "womens-care",
    slug: "womens-care",
    name: "Women's Care",
    blurb: "Hormonal wellness",
    href: "/shop?category=womens-care",
    image: "/images/categories/womens-care.webp",
  },
  {
    id: "majoon",
    slug: "majoon",
    name: "Majoon",
    blurb: "Traditional Unani",
    href: "/shop?category=majoon",
    image: "/images/categories/majoon.webp",
  },
  {
    id: "oils",
    slug: "oils",
    name: "Oils",
    blurb: "Hair & relief",
    href: "/shop?category=oils",
    image: "/images/categories/oils.webp",
  },
  {
    id: "powders",
    slug: "powders",
    name: "Powders",
    blurb: "Pure ground herbs",
    href: "/shop?category=powders",
    image: "/images/categories/powders.webp",
  },
  {
    id: "salajeet",
    slug: "salajeet",
    name: "Salajeet",
    blurb: "Mountain shilajit",
    href: "/shop?category=salajeet",
    image: "/images/categories/salajeet.webp",
  },
  {
    id: "digestion",
    slug: "digestion",
    name: "Digestion",
    blurb: "Stomach & liver",
    href: "/shop?category=digestion",
    image: "/images/categories/digestion.webp",
  },
  {
    id: "seeds",
    slug: "seeds",
    name: "Seeds",
    blurb: "Kalonji, flax & more",
    href: "/shop?category=seeds",
    image: "/images/categories/seeds.webp",
  },
];

export const products: Product[] = [];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

function shuffle<T>(list: T[]) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getProducts(opts?: {
  category?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  excludeBestseller?: boolean;
  excludeNewArrival?: boolean;
  random?: boolean;
  limit?: number;
}) {
  let list = [...products];
  if (opts?.category) list = list.filter((p) => p.category === opts.category);
  if (opts?.featured) list = list.filter((p) => p.featured);
  if (opts?.bestseller) list = list.filter((p) => p.bestseller);
  if (opts?.newArrival) list = list.filter((p) => p.newArrival);
  if (opts?.excludeBestseller) list = list.filter((p) => !p.bestseller);
  if (opts?.excludeNewArrival) list = list.filter((p) => !p.newArrival);
  if (opts?.random) list = shuffle(list);
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

const categoryDefaults: Record<
  CategoryId,
  {
    tagline: string;
    tasteNote: string;
    ingredients: string[];
    howToUse: string[];
    highlights: string[];
    faqs: ProductFaq[];
  }
> = {
  oils: {
    tagline: "Traditional herbal oil for everyday care*",
    tasteNote: "Warm, botanical aroma · External use",
    ingredients: [
      "Cold-pressed carrier oil base",
      "Botanical herb infusion",
      "Natural plant extracts",
    ],
    howToUse: [
      "Warm a small amount between your palms.",
      "Massage gently into scalp, hair, or skin as directed.",
      "Leave on for 30–60 minutes, or overnight for deeper care.",
      "Wash with a mild cleanser. Use 2–3 times weekly.",
    ],
    highlights: [
      "Traditional Unani-inspired formula",
      "No synthetic fragrance",
      "Carefully bottled & sealed",
      "COD available nationwide",
    ],
    faqs: [
      {
        q: "Is this for internal use?",
        a: "Unless labeled otherwise, our oils & tila are intended for external massage and hair/skin care only.",
      },
      {
        q: "How should I store it?",
        a: "Keep tightly closed in a cool, dry place away from direct sunlight.",
      },
    ],
  },
  majoon: {
    tagline: "Classic Unani paste prepared in the traditional style*",
    tasteNote: "Rich, herbal & lightly sweet · Traditional paste",
    ingredients: [
      "Traditional herbal blend",
      "Natural sweetening base",
      "Botanical resins & spices",
    ],
    howToUse: [
      "Take a small spoonful (about 5–10g) as advised.",
      "Best enjoyed with warm milk or lukewarm water.",
      "Use once daily, preferably after a meal.",
      "Follow guidance from a qualified practitioner if needed.",
    ],
    highlights: [
      "Hakim-style traditional paste",
      "Prepared with care",
      "Honest ingredient sourcing",
      "Cash on Delivery",
    ],
    faqs: [
      {
        q: "How long does a jar last?",
        a: "With daily use as directed, most jars last several weeks. Always check the pack date and store sealed.",
      },
      {
        q: "Can children use majoon?",
        a: "Consult a qualified practitioner before giving majoon to children.",
      },
    ],
  },
  powders: {
    tagline: "Finely milled botanicals for daily routines*",
    tasteNote: "Earthy herbal character · Powder form",
    ingredients: [
      "Single-origin or blended botanical powder",
      "No artificial colours",
      "No synthetic fillers",
    ],
    howToUse: [
      "Mix ½–1 teaspoon in warm water, milk, or honey as preferred.",
      "Stir well until smooth.",
      "Take once or twice daily with meals.",
      "For hair/skin powders, blend into a paste with water or oil and apply as a mask.",
    ],
    highlights: [
      "Finely milled texture",
      "Traditional safoof style",
      "Clear usage guidance",
      "Sealed for freshness",
    ],
    faqs: [
      {
        q: "Is the powder bitter?",
        a: "Some herbal powders have a natural earthy taste. Mixing with honey or warm milk can soften the flavour.",
      },
      {
        q: "How do I store powders?",
        a: "Keep the pouch or jar sealed, dry, and away from moisture and heat.",
      },
    ],
  },
  salajeet: {
    tagline: "Mountain resin traditionally valued for vitality*",
    tasteNote: "Mineral-rich · Resin / capsule form",
    ingredients: [
      "Purified Himalayan salajeet (shilajit)",
      "Natural mineral resin",
    ],
    howToUse: [
      "Resin: dissolve a rice-grain amount in warm water or milk.",
      "Capsules: take as directed on the pack with water.",
      "Best taken once daily, preferably in the morning.",
      "Do not exceed the suggested amount.",
    ],
    highlights: [
      "Mountain-sourced resin",
      "Purified with care",
      "Potent traditional tonic",
      "Nationwide COD",
    ],
    faqs: [
      {
        q: "Why does salajeet look sticky?",
        a: "Genuine resin has a thick, sticky texture that softens in warm liquid. That is expected.",
      },
      {
        q: "Is it safe for daily use?",
        a: "Use the suggested amount. If you are pregnant, nursing, or on medication, seek professional advice first.",
      },
    ],
  },
  digestion: {
    tagline: "Botanical support for comfortable digestion*",
    tasteNote: "Aromatic & gently spicy · After-meal friendly",
    ingredients: [
      "Traditional digestive herbs & seeds",
      "Aromatic botanicals",
      "No artificial flavours",
    ],
    howToUse: [
      "Brew as a warm infusion, or take the blend as directed on the pack.",
      "Enjoy after meals for best comfort.",
      "2–3 servings per day as needed.",
      "Stay hydrated throughout the day.",
    ],
    highlights: [
      "After-meal herbal care",
      "Traditional spice wisdom",
      "Gentle daily use",
      "Honest labels",
    ],
    faqs: [
      {
        q: "Can I take this on an empty stomach?",
        a: "Most digestive blends are best after meals. Follow the pack guidance for your specific product.",
      },
      {
        q: "Does it contain caffeine?",
        a: "Our digestive herbals are caffeine-free unless noted otherwise on the pack.",
      },
    ],
  },
  seeds: {
    tagline: "Whole seeds for kitchen & wellness routines*",
    tasteNote: "Nutty, aromatic · Whole seed form",
    ingredients: ["Premium whole botanical seeds", "Cleaned & sorted"],
    howToUse: [
      "Use in cooking, roasting, or traditional preparations.",
      "Store in an airtight container after opening.",
      "For soaking seeds, rinse and soak as preferred overnight.",
      "Consume as part of a balanced daily diet.",
    ],
    highlights: [
      "Whole seed quality",
      "Kitchen & care versatile",
      "Carefully cleaned",
      "Fresh sealed packs",
    ],
    faqs: [
      {
        q: "Are these raw?",
        a: "Yes, unless labeled roasted. Check the product title for roasted or raw.",
      },
      {
        q: "How long do seeds stay fresh?",
        a: "Keep sealed and cool. Best used within a few months of opening for peak aroma.",
      },
    ],
  },
  "mens-care": {
    tagline: "Herbal care crafted for men's vitality routines*",
    tasteNote: "Warm botanical character · Traditional men's care",
    ingredients: [
      "Herbal oil or botanical blend",
      "Traditional vitality herbs",
      "Natural plant extracts",
    ],
    howToUse: [
      "Follow the specific format (oil, paste, or infusion) as labeled.",
      "Use consistently as part of a daily or evening routine.",
      "For oils, massage gently and allow time to absorb.",
      "Pair with balanced rest and nutrition for best results.",
    ],
    highlights: [
      "Men's traditional care",
      "Botanical vitality focus",
      "Clear usage guidance",
      "COD across Pakistan",
    ],
    faqs: [
      {
        q: "How soon will I notice a difference?",
        a: "Herbal routines are gradual. Consistent use over several weeks is typical; results vary by person.",
      },
      {
        q: "Can I combine with other products?",
        a: "Yes, but introduce one new herbal at a time and follow pack guidance.",
      },
    ],
  },
  "womens-care": {
    tagline: "Gentle botanicals for women's everyday care*",
    tasteNote: "Soft floral & botanical · Skin & hair friendly",
    ingredients: [
      "Botanical oils or floral waters",
      "Plant powders & extracts",
      "No harsh synthetic dyes",
    ],
    howToUse: [
      "Apply oils sparingly to clean skin or hair.",
      "For waters and mists, spray onto face or use as a toner.",
      "For powders, mix into a smooth paste before applying.",
      "Patch-test new botanicals if you have sensitive skin.",
    ],
    highlights: [
      "Gentle botanical formulas",
      "Everyday self-care",
      "Thoughtful sourcing",
      "Sealed for quality",
    ],
    faqs: [
      {
        q: "Is this suitable for sensitive skin?",
        a: "Most formulas are gentle, but we recommend a small patch test before first use.",
      },
      {
        q: "Can I use it during pregnancy?",
        a: "Please consult your healthcare provider before using herbal products while pregnant or nursing.",
      },
    ],
  },
};

export type ProductDetail = Product & {
  tagline: string;
  tasteNote: string;
  ingredients: string[];
  howToUse: string[];
  highlights: string[];
  faqs: ProductFaq[];
  categoryName: string;
  sizes: ProductSize[];
  /** Full gallery including primary image */
  images: string[];
};

/** Build a multi-image gallery until real product photos are uploaded */
function resolveGallery(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    const merged = [product.image, ...product.images.filter((src) => src !== product.image)];
    return Array.from(new Set(merged));
  }

  const categoryImage =
    categories.find((c) => c.id === product.category)?.image ?? product.image;
  const extras = [
    "/images/hero-products.webp",
    categoryImage,
    "/images/categories/oils.webp",
    "/images/categories/powders.webp",
    "/images/categories/majoon.webp",
    "/images/categories/seeds.webp",
  ];

  const gallery = [product.image];
  for (const src of extras) {
    if (!gallery.includes(src)) gallery.push(src);
    if (gallery.length >= 4) break;
  }
  return gallery;
}

export function getProductDetailFromProduct(product: Product): ProductDetail {
  const defaults = categoryDefaults[product.category] ?? categoryDefaults.oils;
  const categoryName = categories.find((c) => c.id === product.category)?.name ?? product.category;
  return {
    ...product,
    tagline: product.tagline ?? defaults.tagline,
    tasteNote: product.tasteNote ?? defaults.tasteNote,
    ingredients: product.ingredients ?? defaults.ingredients,
    howToUse: product.howToUse ?? defaults.howToUse,
    highlights: product.highlights ?? defaults.highlights,
    faqs: product.faqs ?? defaults.faqs,
    categoryName,
    sizes: product.sizes ?? defaultProductSizes,
    images: resolveGallery(product),
  };
}

export function getProductDetail(slug: string): ProductDetail | undefined {
  const product = getProduct(slug);
  if (!product) return undefined;
  return getProductDetailFromProduct(product);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return getProducts({ category: product.category, limit: limit + 1 }).filter(
    (p) => p.id !== product.id
  ).slice(0, limit);
}
