export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { recipes } from "@/lib/schema";
import { asc } from "drizzle-orm";
import RecipeList from "@/components/recipe-list";

export default async function RecipesPage() {
  const allRecipes = await db.select().from(recipes).orderBy(asc(recipes.name));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Soloteam Recipes</h1>
        <div className="flex gap-3">
          <Link
            href="/planning"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none sm:py-2"
          >
            Week planning
          </Link>
          <Link
            href="/shopping"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none sm:py-2"
          >
            Shopping list
          </Link>
          <Link
            href="/recipes/new"
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700 sm:flex-none sm:py-2"
          >
            + New recipe
          </Link>
        </div>
      </div>

      <RecipeList recipes={allRecipes} />
    </div>
  );
}
