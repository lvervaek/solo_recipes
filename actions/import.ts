"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recipes } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import { fetchPage, ImportError } from "@/lib/import/fetch";
import { extractRecipeFromHtml } from "@/lib/import/jsonld";
import type { RecipeDraft } from "@/lib/import/types";
import { getAllTags } from "./recipes";

export type ImportResult =
  | { ok: true; draft: RecipeDraft; duplicate: { id: number; name: string } | null }
  | { ok: false; error: string };

export async function importRecipeFromUrl(url: string): Promise<ImportResult> {
  // This fetches arbitrary URLs server-side, so never let it run unauthenticated
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You need to be logged in." };

  try {
    const { html, finalUrl } = await fetchPage(url);
    const draft = extractRecipeFromHtml(html, finalUrl);
    if (!draft || draft.ingredients.length === 0) {
      return {
        ok: false,
        error: "Couldn't find a recipe on that page. The site doesn't publish recipe data, so you'll have to add it by hand.",
      };
    }

    // Reuse the spelling of tags we already have ("Pasta" vs "pasta")
    const existing = await getAllTags();
    draft.tags = [
      ...new Set(draft.tags.map((t) => existing.find((e) => e.toLowerCase() === t.toLowerCase()) ?? t)),
    ];

    const [dup] = await db
      .select({ id: recipes.id, name: recipes.name })
      .from(recipes)
      .where(inArray(recipes.link, [...new Set([url.trim(), finalUrl])]))
      .limit(1);

    return { ok: true, draft, duplicate: dup ?? null };
  } catch (e) {
    if (e instanceof ImportError) return { ok: false, error: e.message };
    console.error("Recipe import failed", e);
    return { ok: false, error: "Something went wrong while importing. Try again or add it by hand." };
  }
}
