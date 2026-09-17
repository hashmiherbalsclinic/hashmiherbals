export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  readMinutes: number;
  category: string;
  image: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "kalonji-oil-everyday-wellness",
    title: "Kalonji oil for everyday wellness",
    excerpt:
      "How cold-pressed black seed oil fits into a simple daily herbal routine at home.",
    body: [
      "Kalonji, or black seed, has long held a place in Unani and traditional home care across Pakistan. Cold-pressed oil is often used in small amounts as part of a steady daily habit.",
      "Many households take a little with honey or warm water, or warm a few drops for gentle massage. Start slowly if you are new to kalonji oil, and keep the bottle sealed away from heat and sunlight.",
      "As with all herbal products, this is traditional wellness support, not a substitute for medical advice. If you are pregnant, nursing, or on medication, speak with a qualified practitioner first.",
    ],
    date: "2026-08-12",
    readMinutes: 4,
    category: "Oils",
    image: "/images/categories/oils.webp",
  },
  {
    slug: "understanding-salajeet",
    title: "Understanding salajeet (shilajit)",
    excerpt:
      "What purified mountain resin is, why texture matters, and how people traditionally use it.",
    body: [
      "Salajeet is a mineral-rich resin traditionally valued for vitality. Genuine resin often looks thick and sticky, and softens when stirred into warm water or milk.",
      "A rice-grain amount is a common starting point for resin. Capsules should be taken as labeled. Consistency matters more than large amounts.",
      "Buy purified salajeet from a trusted source, store it cool and sealed, and avoid exceeding the suggested serving.",
    ],
    date: "2026-07-28",
    readMinutes: 5,
    category: "Salajeet",
    image: "/images/categories/salajeet.webp",
  },
  {
    slug: "majoon-the-traditional-paste",
    title: "Majoon: the traditional Unani paste",
    excerpt:
      "A short guide to majoon, how it is typically taken, and what to expect from a classic paste.",
    body: [
      "Majoon is a classic Unani-style herbal paste, usually prepared with botanicals in a lightly sweet base. It is meant to be taken in small spoonfuls as part of a regular routine.",
      "Many people enjoy majoon with warm milk or lukewarm water after a meal. Follow pack guidance, and ask a practitioner if you are unsure about suitability for children or specific conditions.",
      "Store jars sealed and cool. Quality majoon should feel authentic to the tradition: rich, herbal, and carefully prepared.",
    ],
    date: "2026-07-05",
    readMinutes: 3,
    category: "Majoon",
    image: "/images/categories/majoon.webp",
  },
  {
    slug: "digestive-herbs-after-meals",
    title: "Gentle digestive herbs after meals",
    excerpt:
      "Simple after-meal botanicals that Pakistani kitchens have trusted for comfortable digestion.",
    body: [
      "Digestive herb blends and seeds such as saunf are often enjoyed after meals for comfort. Warm infusions and lightly aromatic mixes are easy to keep in the kitchen.",
      "Two to three servings a day as needed is typical for many blends. Stay hydrated, and prefer after-meal use unless your pack says otherwise.",
      "Look for clear labels without artificial flavours when choosing digestive herbals for everyday use.",
    ],
    date: "2026-06-18",
    readMinutes: 4,
    category: "Digestion",
    image: "/images/categories/digestion.webp",
  },
  {
    slug: "powders-and-safoof-at-home",
    title: "Powders & safoof at home",
    excerpt:
      "How to store and use finely milled herbal powders in daily milk, water, or hair and skin pastes.",
    body: [
      "Herbal powders and safoof are versatile: mix a small spoon into warm water, milk, or honey, or blend into a paste for hair and skin routines.",
      "Keep pouches and jars sealed and dry. Moisture softens texture and shortens freshness. An earthy taste is normal for many single-herb powders.",
      "Introduce one new powder at a time so you can notice how your body responds.",
    ],
    date: "2026-05-30",
    readMinutes: 3,
    category: "Powders",
    image: "/images/categories/powders.webp",
  },
  {
    slug: "cod-ordering-tips",
    title: "Tips for smooth COD orders",
    excerpt:
      "How to place a Cash on Delivery order with Hashmi Herbals and what to expect at delivery.",
    body: [
      "Cash on Delivery is available nationwide. Keep your phone reachable on delivery day, and double-check your name, number, and address at checkout.",
      `Orders of PKR 2,000+ usually qualify for free shipping. Smaller orders may include a flat courier fee.`,
      "If a parcel arrives damaged or incorrect, contact us quickly with photos so we can help with a replacement or refund under our policy.",
    ],
    date: "2026-05-10",
    readMinutes: 3,
    category: "Shopping",
    image: "/images/hero-products.webp",
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatBlogDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
