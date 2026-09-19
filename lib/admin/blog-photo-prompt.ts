"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  geminiUserError,
  withGeminiModelFallback,
} from "@/lib/admin/gemini-models";

export type GeneratePhotoPromptInput = {
  topic: string;
  title?: string;
  excerpt?: string;
  category?: string;
  notes?: string;
  language?: "en" | "ur";
};

export type GeneratePhotoPromptResult =
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
      "One complete ultra-photorealistic image generation prompt, 80–160 words, ready to paste into Gemini / Midjourney / ChatGPT image tools"
    ),
  negativePrompt: z
    .string()
    .describe(
      "Comma-separated things to avoid (illustration, cartoon, text, watermark, etc.)"
    ),
  shortCaption: z
    .string()
    .describe("One short line describing what the photo should show"),
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

export async function generateBlogPhotoPrompt(
  input: GeneratePhotoPromptInput
): Promise<GeneratePhotoPromptResult> {
  const auth = await requireAdmin();
  if (auth.error) return { ok: false, error: auth.error };

  const topic = input.topic?.trim();
  if (!topic || topic.length < 3) {
    return {
      ok: false,
      error: "Enter a topic or title first so the photo prompt matches the post.",
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
  const excerpt = input.excerpt?.trim() || "";
  const category = input.category?.trim() || "";
  const notes = input.notes?.trim() || "";
  const language = input.language === "ur" ? "ur" : "en";

  try {
    const { data: object, modelId } = await withGeminiModelFallback(
      async (model) => {
        const { object: result } = await generateObject({
          model,
          schema: promptSchema,
          temperature: 0.65,
          prompt: `You write the BEST possible ultra-realistic photography prompts for Hashmi Herbals blog covers (Unani / herbal wellness brand in Pakistan).

The admin will paste your prompt into an image tool (Gemini, Midjourney, etc.) to create the photo. Do NOT generate an image — only write prompts.

Post context:
- Topic: ${topic}
${title ? `- Title: ${title}` : ""}
${excerpt ? `- Excerpt: ${excerpt}` : ""}
${category ? `- Category: ${category}` : ""}
${notes ? `- Extra notes: ${notes}` : ""}
- Blog language: ${language === "ur" ? "Urdu post (visuals can still be described in English)" : "English"}

Write prompt that:
1. Matches THIS specific post (herbs, oils, seeds, lifestyle, or ritual that fits the topic — not generic).
2. Is ultra photorealistic / DSLR editorial quality for a luxury herbal D2C blog hero (16:9 feel).
3. Includes camera/lens/lighting/composition cues (e.g. 85mm, soft window light, shallow DOF, natural textures).
4. Uses warm earthy Hashmi Herbals palette (greens, amber, cream, wood) when natural.
5. Is a single paste-ready paragraph (no markdown, no bullet list inside prompt).
6. Never asks for logos, watermarks, readable text, or brand names burned into the image.
7. Avoids cartoon, CGI, plastic AI look, oversaturated HDR.

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
    console.error("generateBlogPhotoPrompt", err);
    const message =
      err instanceof Error ? err.message : "Could not generate photo prompt.";
    return { ok: false, error: geminiUserError(message) || message };
  }
}
