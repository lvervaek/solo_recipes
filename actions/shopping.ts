"use server";

import { db } from "@/lib/db";
import { recipes, ingredients } from "@/lib/schema";
import { inArray, eq } from "drizzle-orm";
import { buildShoppingList, type RecipeSelection, type ShoppingItem } from "@/lib/shopping";

export type ShoppingInput = {
  recipeId: number;
  targetPeople: number;
};

export async function generateShoppingList(inputs: ShoppingInput[]): Promise<ShoppingItem[]> {
  if (inputs.length === 0) return [];

  const recipeIds = inputs.map((i) => i.recipeId);

  const [allRecipes, allIngredients] = await Promise.all([
    db.select().from(recipes).where(inArray(recipes.id, recipeIds)),
    db.select().from(ingredients).where(inArray(ingredients.recipeId, recipeIds)),
  ]);

  const selections: RecipeSelection[] = allRecipes.map((recipe) => {
    const input = inputs.find((i) => i.recipeId === recipe.id)!;
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      basePeople: recipe.basePeople,
      targetPeople: input.targetPeople,
      ingredients: allIngredients
        .filter((ing) => ing.recipeId === recipe.id)
        .map((ing) => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit })),
    };
  });

  return buildShoppingList(selections);
}
