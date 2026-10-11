"use server";

import { db } from "@/lib/db";
import { recipes, ingredients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseRecipeForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const tags = formData.getAll("tags") as string[];
  const basePeople = parseInt(formData.get("basePeople") as string, 10);
  const link = (formData.get("link") as string) || null;
  const instructions = (formData.get("instructions") as string) || null;

  // Parse ingredients from indexed form fields; skip rows left empty
  const ingredientNames = formData.getAll("ingredientName") as string[];
  const ingredientQtys = formData.getAll("ingredientQty") as string[];
  const ingredientUnits = formData.getAll("ingredientUnit") as string[];

  const ings = ingredientNames
    .map((ingName, i) => ({
      name: ingName.trim(),
      // Empty quantity = "to taste", stored as 0
      quantity: ingredientQtys[i]?.trim() || "0",
      unit: ingredientUnits[i] || "#",
    }))
    .filter((ing) => ing.name);

  return { name, tags, basePeople, link, instructions, ings };
}

export async function createRecipe(formData: FormData) {
  const { name, tags, basePeople, link, instructions, ings } = parseRecipeForm(formData);
  if (!name || !basePeople || ings.length === 0) return;

  const [recipe] = await db
    .insert(recipes)
    .values({ name, tags, basePeople, link, instructions })
    .returning({ id: recipes.id });

  await db.insert(ingredients).values(
    ings.map((ing, i) => ({ ...ing, recipeId: recipe.id, sortOrder: i }))
  );

  revalidatePath("/recipes");
  redirect("/recipes");
}

export async function updateRecipe(id: number, formData: FormData) {
  const { name, tags, basePeople, link, instructions, ings } = parseRecipeForm(formData);
  if (!name || !basePeople || ings.length === 0) return;

  // Replace the ingredient list wholesale; batch runs as one transaction on neon-http
  await db.batch([
    db.update(recipes).set({ name, tags, basePeople, link, instructions }).where(eq(recipes.id, id)),
    db.delete(ingredients).where(eq(ingredients.recipeId, id)),
    db.insert(ingredients).values(ings.map((ing, i) => ({ ...ing, recipeId: id, sortOrder: i }))),
  ]);

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  redirect(`/recipes/${id}`);
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
