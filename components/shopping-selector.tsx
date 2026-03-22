"use client";

import { useState, useTransition } from "react";
import { generateShoppingList, type ShoppingInput } from "@/actions/shopping";
import { formatQuantity, type ShoppingItem } from "@/lib/shopping";
import type { Recipe } from "@/lib/schema";

export default function ShoppingSelector({ allRecipes }: { allRecipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ShoppingItem[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleRecipes = query.trim()
    ? allRecipes.filter((r) => {
        const q = query.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
      })
    : allRecipes;

  function toggle(recipe: Recipe) {
    setSelected((prev) => {
      if (prev[recipe.id] !== undefined) {
        const next = { ...prev };
        delete next[recipe.id];
        return next;
      }
      return { ...prev, [recipe.id]: recipe.basePeople };
    });
    setResult(null);
  }

  function setPeople(recipeId: number, people: number) {
    setSelected((prev) => ({ ...prev, [recipeId]: people }));
    setResult(null);
  }

  function generate() {
    const inputs: ShoppingInput[] = Object.entries(selected).map(([id, people]) => ({
      recipeId: parseInt(id, 10),
      targetPeople: people,
    }));
    startTransition(async () => {
      const list = await generateShoppingList(inputs);
      setResult(list);
    });
  }

  function copyToClipboard() {
    if (!result) return;
    const text = result.map((i) => `${i.name} — ${formatQuantity(i.quantity)} ${i.unit}`).join("\n");
    navigator.clipboard.writeText(text);
  }

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or tag…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      {/* Recipe selector */}
      <div className="flex flex-col gap-3">
        {visibleRecipes.map((recipe) => {
          const isSelected = selected[recipe.id] !== undefined;
          return (
            <div
              key={recipe.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                isSelected ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(recipe)}
                className="mt-0.5 h-4 w-4 rounded accent-indigo-600"
              />
              <div className="flex-1">
                <div className="cursor-pointer" onClick={() => toggle(recipe)}>
                  <span className="font-medium text-gray-900">{recipe.name}</span>
                  {recipe.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
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
                {isSelected && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <label>Serves</label>
                    <input
                      type="number"
                      min={1}
                      value={selected[recipe.id]}
                      onChange={(e) => setPeople(recipe.id, parseInt(e.target.value, 10) || 1)}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={selectedCount === 0 || isPending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isPending ? "Generating…" : `Generate shopping list (${selectedCount} recipe${selectedCount !== 1 ? "s" : ""})`}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Shopping list</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Copy
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Print
              </button>
            </div>
          </div>
          {result.length === 0 ? (
            <p className="text-sm text-gray-500">No ingredients found.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {result.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm">
                  <span className="text-gray-800">{item.name}</span>
                  <span className="shrink-0 text-gray-500">
                    {formatQuantity(item.quantity)} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
