"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  geminiUserError,
  withGeminiModelFallback,
} from "@/lib/admin/gemini-models";

const CATEGORIES = [
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

const blogSchema = z.object({
  title: z
    .string()
    .describe("Compelling blog title, max ~70 characters, no clickbait"),
  excerpt: z
    .string()
    .describe(
      "1–2 sentence summary for listing cards and SEO, max ~180 characters"
    ),
  category: z.enum(CATEGORIES).describe("Best-fit category from the allowed list"),
  bodyHtml: z
    .string()
    .describe(
      "Full article as clean HTML using only: h2, h3, p, ul, ol, li, strong, em, blockquote, a. No scripts, styles, images, or markdown."
    ),
});

export type GenerateBlogInput = {
  topic: string;
  notes?: string;
  tone?: "educational" | "warm" | "clinical";
  length?: "short" | "medium" | "long";
  language?: "en" | "ur";
};

export type GenerateBlogResult =
  | {
      ok: true;
      title: string;
      excerpt: string;
      category: string;
      bodyHtml: string;
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

/** Lightweight sanitizer — avoids isomorphic-dompurify/jsdom cold-start cost on Vercel. */
function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

const LENGTH_GUIDE = {
  short: "about 450–650 words, 3–4 sections",
  medium: "about 800–1100 words, 4–6 sections",
  long: "about 1200–1600 words, 6–8 sections",
} as const;

const TONE_GUIDE = {
  educational: "clear, informative, practical tips",
  warm: "welcoming, story-led, community-minded",
  clinical: "precise Unani framing, careful and professional",
} as const;

const LANGUAGE_GUIDE = {
  en: `Language: Write the entire title, excerpt, and bodyHtml in clear English.
- Do not use Urdu script.`,
  ur: `Language: Write the entire title, excerpt, and bodyHtml in natural Pakistani Urdu (اردو).
- Use proper Urdu script (Nastaliq-friendly Unicode), not Roman Urdu.
- Topic/notes from the admin may be in English — translate and write the article in Urdu.
- Category value must still be exactly one English label from the allowed list.
- On every block element (p, h2, h3, ul, ol, blockquote) set dir="rtl" and lang="ur".
- Disclaimer at the end should also be in Urdu.`,
} as const;

export async function generateBlogDraft(
  input: GenerateBlogInput
): Promise<GenerateBlogResult> {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { ok: false, error: auth.error };

    const topic = input.topic?.trim();
    if (!topic || topic.length < 4) {
      return { ok: false, error: "Enter a topic (at least a few words)." };
    }
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
      return {
        ok: false,
        error:
          "Missing GOOGLE_GENERATIVE_AI_API_KEY on the server. Add it in Vercel Environment Variables, then redeploy.",
      };
    }

    const tone = input.tone ?? "educational";
    const length = input.length ?? "medium";
    const language = input.language === "ur" ? "ur" : "en";
    const notes = input.notes?.trim() || "";

    const { data: object, modelId } = await withGeminiModelFallback(
      async (model) => {
        const { object: result } = await generateObject({
          model,
          schema: blogSchema,
          temperature: 0.7,
          prompt: `You are the content writer for Hashmi Herbals, a trusted Unani / herbal clinic and D2C brand in Pakistan (Hashmi Herbals).

Write an original blog post draft for the website admin to review and edit.

Topic: ${topic}
${notes ? `Extra notes from admin: ${notes}` : ""}
Tone: ${TONE_GUIDE[tone]}
Length: ${LENGTH_GUIDE[length]}

${LANGUAGE_GUIDE[language]}

Brand voice rules:
- Warm, respectful, rooted in Unani herbal tradition and everyday Pakistani wellness.
- Educational, not salesy. Soft product mentions are OK only when natural.
- Never invent medical diagnoses, guaranteed cures, or unsafe dosage claims.
- Include a short disclaimer near the end: consult a qualified practitioner for personal medical advice.
- Prefer practical routines, ingredient context, and lifestyle tips.
- Audience: customers in Pakistan (and diaspora) interested in herbal wellness.

HTML rules for bodyHtml:
- Start with an opening <p>, then use <h2> section headings (and <h3> if needed).
- Use <ul>/<ol> where lists help.
- Allowed tags only: h2, h3, p, ul, ol, li, strong, em, blockquote, a.
- Allowed attributes: href, target, rel, dir, lang.
- No markdown, no images, no inline CSS, no scripts.
- Do not wrap the document in <html> or <body>.

Pick the single best category from: ${CATEGORIES.join(", ")}.
Title should be specific and useful. Excerpt must stand alone on the blogs listing.`,
        });
        return result;
      }
    );

    const bodyHtml = sanitizeBlogHtml(object.bodyHtml);
    if (!bodyHtml || bodyHtml.replace(/<[^>]+>/g, "").trim().length < 80) {
      return { ok: false, error: "AI returned empty content. Try again." };
    }

    return {
      ok: true,
      title: object.title.trim(),
      excerpt: object.excerpt.trim(),
      category: object.category,
      bodyHtml,
      modelId,
    };
  } catch (err) {
    console.error("generateBlogDraft", err);
    const message =
      err instanceof Error ? err.message : "Could not generate blog draft.";
    return { ok: false, error: geminiUserError(message) || message };
  }
}
