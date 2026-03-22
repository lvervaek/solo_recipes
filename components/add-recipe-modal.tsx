"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/schema";

type Props = {
  recipes: Recipe[];
  onAdd: (recipes: Recipe[]) => void;
  onClose: () => void;
};

export default function AddRecipeModal({ recipes, onAdd, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filtered = query.trim()
    ? recipes.filter((r) => {
        const q = query.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
      })
    : recipes;

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function confirm() {
    const selected = recipes.filter((r) => selectedIds.has(r.id));
    onAdd(selected);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Add recipe</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or tag…"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <ul className="flex-1 overflow-y-auto flex flex-col gap-1">
          {filtered.length === 0 && (
            <li className="py-4 text-center text-sm text-gray-400">No recipes found</li>
          )}
          {filtered.map((recipe) => (
            <li
              key={recipe.id}
              onClick={() => toggle(recipe.id)}
              className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                selectedIds.has(recipe.id) ? "bg-indigo-50" : "hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(recipe.id)}
                onChange={() => toggle(recipe.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 h-4 w-4 accent-indigo-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{recipe.name}</span>
                {recipe.tags.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {recipe.tags.map((t) => (
                      <span key={t} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-3">
          <button
            onClick={confirm}
            disabled={selectedIds.size === 0}
            className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
