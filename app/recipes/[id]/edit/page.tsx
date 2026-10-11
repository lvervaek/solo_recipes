export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { recipes, ingredients } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import RecipeForm from "@/components/recipe-form";
import { getAllTags, updateRecipe } from "@/actions/recipes";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId));
  if (!recipe) notFound();

  const [ings, existingTags] = await Promise.all([
    db
      .select()
      .from(ingredients)
      .where(eq(ingredients.recipeId, recipeId))
      .orderBy(asc(ingredients.sortOrder)),
    getAllTags(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Edit recipe</h1>
      <RecipeForm
        existingTags={existingTags}
        action={updateRecipe.bind(null, recipeId)}
        submitLabel="Save changes"
        cancelHref={`/recipes/${recipeId}`}
        initial={{
          name: recipe.name,
          tags: recipe.tags,
          basePeople: recipe.basePeople,
          link: recipe.link ?? "",
          instructions: recipe.instructions ?? "",
          ingredients: ings.map((ing) => ({
            name: ing.name,
            qty: String(parseFloat(ing.quantity)),
            unit: ing.unit,
          })),
        }}
      />
    </div>
  );
}
