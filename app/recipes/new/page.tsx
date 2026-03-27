export const dynamic = "force-dynamic";

import RecipeForm from "@/components/recipe-form";
import { getAllTags } from "@/actions/recipes";

export default async function NewRecipePage() {
  const existingTags = await getAllTags();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">New recipe</h1>
      <RecipeForm existingTags={existingTags} />
    </div>
  );
}
