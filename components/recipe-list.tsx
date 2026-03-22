"use client";

import { useState } from "react";
import RecipeCard from "@/components/recipe-card";
import type { Recipe } from "@/lib/schema";

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? recipes.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : recipes;

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or tag…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">
          {query ? "No recipes match your search." : "No recipes yet. Add your first one!"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
