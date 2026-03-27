export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { recipes, ingredients } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteRecipe } from "@/actions/recipes";
import DeleteRecipeButton from "@/components/delete-recipe-button";
import Link from "next/link";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId));
  if (!recipe) notFound();

  const ings = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.recipeId, recipeId))
    .orderBy(asc(ingredients.sortOrder));

  async function handleDelete() {
    "use server";
    await deleteRecipe(recipeId);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/recipes" className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to recipes
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{recipe.name}</h1>
          <DeleteRecipeButton action={handleDelete} />
        </div>
        {recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="mb-6 text-sm text-gray-500">Serves {recipe.basePeople}</p>

      {recipe.link && (
        <a
          href={recipe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 inline-block text-sm text-indigo-600 hover:underline"
        >
          View source recipe ↗
        </a>
      )}

      <h2 className="mb-3 font-medium text-gray-900">Ingredients</h2>
      <ul className="flex flex-col gap-2">
        {ings.map((ing) => (
          <li key={ing.id} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm">
            <span className="text-gray-800">{ing.name}</span>
            <span className="shrink-0 text-gray-500">
              {ing.quantity} {ing.unit}
            </span>
          </li>
        ))}
      </ul>

      {recipe.instructions && (
        <div className="mt-8">
          <h2 className="mb-3 font-medium text-gray-900">Instructions</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {recipe.instructions}
          </p>
        </div>
      )}
    </div>
  );
}
