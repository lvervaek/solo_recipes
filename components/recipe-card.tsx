import Link from "next/link";
import type { Recipe } from "@/lib/schema";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium text-gray-900">{recipe.name}</h2>
        <span className="shrink-0 text-sm text-gray-400">serves {recipe.basePeople}</span>
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
      {recipe.link && (
        <p className="mt-2 text-xs text-gray-400">has source link</p>
      )}
    </Link>
  );
}
