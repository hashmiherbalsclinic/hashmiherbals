"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  geminiUserError,
  withGeminiModelFallback,
} from "@/lib/admin/gemini-models";

export type GenerateProductPhotoPromptInput = {
  productName: string;
  title?: string;
  description?: string;
  category?: string;
  tagline?: string;
  notes?: string;
  language?: "en" | "ur";
};

export type GenerateProductPhotoPromptResult =
  | {
      ok: true;
      prompt: string;
      negativePrompt: string;
      shortCaption: string;
      modelId?: string;
    }
  | { ok: false; error: string };

const promptSchema = z.object({
  prompt: z
    .string()
    .describe(
      "One complete ultra-photorealistic product photo prompt, 80–160 words, ready to paste into Gemini / Midjourney / ChatGPT image tools"
    ),
  negativePrompt: z
    .string()
    .describe(
      "Comma-separated things to avoid (illustration, cartoon, text, watermark, etc.)"
    ),
  shortCaption: z
    .string()
    .describe("One short line describing what the product photo should show"),
});

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

export async function generateProductPhotoPrompt(
  input: GenerateProductPhotoPromptInput
): Promise<GenerateProductPhotoPromptResult> {
  const auth = await requireAdmin();
  if (auth.error) return { ok: false, error: auth.error };

  const productName = input.productName?.trim();
  if (!productName || productName.length < 2) {
    return {
      ok: false,
      error:
        "Enter a product name or title first so the photo prompt matches the product.",
    };
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      ok: false,
      error:
        "Missing GOOGLE_GENERATIVE_AI_API_KEY. Add your Gemini API key to .env.local.",
    };
  }

  const title = input.title?.trim() || "";
  const description = input.description?.trim() || "";
  const category = input.category?.trim() || "";
  const tagline = input.tagline?.trim() || "";
  const notes = input.notes?.trim() || "";
  const language = input.language === "ur" ? "ur" : "en";

  try {
    const { data: object, modelId } = await withGeminiModelFallback(
      async (model) => {
        const { object: result } = await generateObject({
          model,
          schema: promptSchema,
          temperature: 0.65,
          prompt: `You write the BEST possible ultra-realistic product photography prompts for Hashmi Herbals (Unani / herbal D2C brand in Pakistan).

The admin will paste your prompt into an image tool (Gemini, Midjourney, etc.) to create the product photo. Do NOT generate an image — only write prompts.

Product context:
- Product name: ${productName}
${title ? `- Title: ${title}` : ""}
${tagline ? `- Tagline: ${tagline}` : ""}
${description ? `- Description: ${description}` : ""}
${category ? `- Category: ${category}` : ""}
${notes ? `- Extra notes: ${notes}` : ""}
- Listing language: ${language === "ur" ? "Urdu copy (visuals can still be described in English)" : "English"}

Write a prompt that:
1. Shows THIS specific herbal product as the hero subject (jar, bottle, resin, powder pouch, oil, majoon, etc. — match the product).
2. Is ultra photorealistic / commercial product photography for an e-commerce PDP — full-bleed square crop friendly (subject fills most of the frame; little empty margin).
3. Includes camera/lens/lighting cues (e.g. 85mm, soft window light, shallow DOF, linen or wood surface).
4. Uses warm earthy Hashmi Herbals palette (greens, amber, cream, wood) when natural.
5. Is a single paste-ready paragraph (no markdown, no bullet list inside prompt).
6. Never asks for logos, watermarks, readable labels/text, barcodes, or brand names burned into the image.
7. Avoids cartoon, CGI, plastic AI look, oversaturated HDR, cluttered backgrounds.
8. Compose so the product can be shown edge-to-edge with object-cover (no tiny floating subject in empty space).

Also provide a strong negativePrompt and a one-line shortCaption of the scene.`,
        });
        return result;
      }
    );

    return {
      ok: true,
      prompt: object.prompt.trim(),
      negativePrompt: object.negativePrompt.trim(),
      shortCaption: object.shortCaption.trim(),
      modelId,
    };
  } catch (err) {
    console.error("generateProductPhotoPrompt", err);
    const message =
      err instanceof Error ? err.message : "Could not generate photo prompt.";
    return { ok: false, error: geminiUserError(message) || message };
  }
}
