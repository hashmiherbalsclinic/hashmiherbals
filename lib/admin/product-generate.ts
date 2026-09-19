"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  geminiUserError,
  withGeminiModelFallback,
} from "@/lib/admin/gemini-models";
import { PRODUCT_CATEGORIES } from "@/lib/admin/types";

const CATEGORIES = PRODUCT_CATEGORIES;

const productSchema = z.object({
  title: z
    .string()
    .describe("Clean product display name, max ~60 characters, no price or pack size"),
  tagline: z
    .string()
    .describe("One-line claim under the title, max ~90 characters"),
  description: z
    .string()
    .describe(
      "2 short sentences: what the product is, and its main traditional use. No prices, pack sizes, or medical cure claims."
    ),
  category: z
    .enum(CATEGORIES)
    .describe("Best-fit shop category from the allowed list"),
  tasteNote: z
    .string()
    .describe("Short sensory / taste note, or empty string if not relevant"),
  benefits: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("4 concise key benefits / uses, no dosage amounts"),
  ingredients: z
    .array(z.string())
    .min(1)
    .max(12)
    .describe("Main herbs / ingredients as short names"),
  howToUse: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe(
      "3 short dosage / direction steps. Use relative phrasing like 'as labeled' or 'a small amount' — never invent exact grams, ml, or PKR prices."
    ),
  highlights: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe("Short product highlights / quality points"),
  faqs: z
    .array(
      z.object({
        q: z.string().describe("Customer FAQ question"),
        a: z.string().describe("Helpful answer without inventing exact dosages or prices"),
      })
    )
    .min(3)
    .max(6)
    .describe("3–5 FAQs for the product page"),
});

export type GenerateProductInput = {
  productName: string;
  notes?: string;
  language?: "en" | "ur";
  categoryHint?: string;
};

export type GenerateProductResult =
  | {
      ok: true;
      title: string;
      tagline: string;
      description: string;
      category: string;
      tasteNote: string;
      benefits: string[];
      ingredients: string[];
      howToUse: string[];
      highlights: string[];
      faqs: { q: string; a: string }[];
      modelId?: string;
    }
  | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Admin access required." as const };
  }

  return { error: null };
}

const LANGUAGE_GUIDE = {
  en: `Language: Write all copy fields in clear English.
- Do not use Urdu script.`,
  ur: `Language: Write title, tagline, description, tasteNote, benefits, ingredients, howToUse, highlights, and FAQ text in natural Pakistani Urdu (اردو).
- Use proper Urdu script, not Roman Urdu.
- Category value must still be exactly one English id from the allowed list.`,
} as const;

export async function generateProductDraft(
  input: GenerateProductInput
): Promise<GenerateProductResult> {
  const auth = await requireAdmin();
  if (auth.error) return { ok: false, error: auth.error };

  const productName = input.productName?.trim();
  if (!productName || productName.length < 2) {
    return { ok: false, error: "Enter a product name (at least a few words)." };
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      ok: false,
      error:
        "Missing GOOGLE_GENERATIVE_AI_API_KEY. Add your Gemini API key to .env.local.",
    };
  }

  const language = input.language === "ur" ? "ur" : "en";
  const notes = input.notes?.trim() || "";
  const categoryHint = input.categoryHint?.trim() || "";

  try {
    const { data: object, modelId } = await withGeminiModelFallback(
      async (model) => {
        const { object: result } = await generateObject({
          model,
          schema: productSchema,
          temperature: 0.65,
          prompt: `You write product listing copy for Hashmi Herbals, a trusted Unani / herbal clinic and D2C brand in Pakistan.

Generate storefront product details for the admin form. The admin will add pack sizes, weights, and PKR prices themselves — never invent prices, stock, ratings, or exact pack amounts.

Product name / topic: ${productName}
${notes ? `Extra notes from admin: ${notes}` : ""}
${categoryHint ? `Preferred category id (use if it fits): ${categoryHint}` : ""}

${LANGUAGE_GUIDE[language]}

Brand voice rules:
- Warm, respectful, rooted in Unani herbal tradition and everyday Pakistani wellness.
- Educational and trustworthy — not hypey or clickbait.
- Never invent medical diagnoses, guaranteed cures, or unsafe dosage claims.
- Prefer traditional-use framing and "as advised by a practitioner" where needed.
- Do NOT include PKR amounts, sale prices, compare-at prices, shipping fees, or pack sizes (g/kg/ml) as facts.
- For howToUse, stay general (e.g. "Take as labeled", "Mix a small amount with warm water or milk").

Category must be exactly one of: ${CATEGORIES.join(", ")}.

Title should be shop-ready. Tagline is one short claim. Description is 2 sentences max.
Benefits: about 4 lines. How-to-use: about 3 steps. FAQs: practical customer questions.`,
        });
        return result;
      }
    );

    const benefits = object.benefits.map((s) => s.trim()).filter(Boolean);
    const howToUse = object.howToUse.map((s) => s.trim()).filter(Boolean);
    if (!object.title.trim() || !object.description.trim() || benefits.length < 2) {
      return { ok: false, error: "AI returned incomplete product details. Try again." };
    }

    return {
      ok: true,
      title: object.title.trim(),
      tagline: object.tagline.trim(),
      description: object.description.trim(),
      category: object.category,
      tasteNote: object.tasteNote.trim(),
      benefits,
      ingredients: object.ingredients.map((s) => s.trim()).filter(Boolean),
      howToUse,
      highlights: object.highlights.map((s) => s.trim()).filter(Boolean),
      faqs: object.faqs
        .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
        .filter((f) => f.q && f.a),
      modelId,
    };
  } catch (err) {
    console.error("generateProductDraft", err);
    const message =
      err instanceof Error ? err.message : "Could not generate product details.";
    return { ok: false, error: geminiUserError(message) || message };
  }
}
