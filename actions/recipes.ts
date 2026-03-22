"use server";

import { db } from "@/lib/db";
import { recipes, ingredients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRecipe(formData: FormData) {
  const name = formData.get("name") as string;
  const tags = formData.getAll("tags") as string[];
  const basePeople = parseInt(formData.get("basePeople") as string, 10);
  const link = (formData.get("link") as string) || null;
  const instructions = (formData.get("instructions") as string) || null;

  // Parse ingredients from indexed form fields
  const ingredientNames = formData.getAll("ingredientName") as string[];
  const ingredientQtys = formData.getAll("ingredientQty") as string[];
  const ingredientUnits = formData.getAll("ingredientUnit") as string[];

  if (!name || !basePeople || ingredientNames.length === 0) return;

  const [recipe] = await db
    .insert(recipes)
    .values({ name, tags, basePeople, link, instructions })
    .returning({ id: recipes.id });

  await db.insert(ingredients).values(
    ingredientNames.map((ingName, i) => ({
      recipeId: recipe.id,
      name: ingName,
      quantity: ingredientQtys[i],
      unit: ingredientUnits[i],
      sortOrder: i,
    }))
  );

  revalidatePath("/recipes");
  redirect("/recipes");
}

export async function getAllTags(): Promise<string[]> {
  const rows = await db.select({ tags: recipes.tags }).from(recipes);
  const all = rows.flatMap((r) => r.tags);
  return [...new Set(all)].sort();
}

export async function deleteRecipe(id: number) {
  await db.delete(recipes).where(eq(recipes.id, id));
  revalidatePath("/recipes");
  redirect("/recipes");
}
