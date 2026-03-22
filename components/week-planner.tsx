"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import type { Recipe } from "@/lib/schema";
import { buildDayWindow, type WeekPlanStore, type PlanEntry } from "@/lib/planning";
import { generateShoppingList, type ShoppingInput } from "@/actions/shopping";
import { formatQuantity, type ShoppingItem } from "@/lib/shopping";
import DayCard from "@/components/day-card";
import AddRecipeModal from "@/components/add-recipe-modal";

const STORAGE_KEY = "weekplan";

export default function WeekPlanner({ allRecipes }: { allRecipes: Recipe[] }) {
  const days = useMemo(() => buildDayWindow(), []);

  const [plan, setPlan] = useState<WeekPlanStore>({});
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [shoppingResult, setShoppingResult] = useState<ShoppingItem[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [listCopied, setListCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPlan(JSON.parse(stored));
    } catch {}
  }, []);

  function savePlan(next: WeekPlanStore) {
    setPlan(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function addRecipes(isoDate: string, recipes: Recipe[]) {
    const existing = plan[isoDate]?.entries ?? [];
    const existingIds = new Set(
      existing.filter((e): e is Extract<PlanEntry, { type: "recipe" }> => e.type === "recipe")
        .map((e) => e.recipeId)
    );
    const newEntries: PlanEntry[] = recipes
      .filter((r) => !existingIds.has(r.id))
      .map((r) => ({ type: "recipe", recipeId: r.id, recipeName: r.name }));
    savePlan({ ...plan, [isoDate]: { entries: [...existing, ...newEntries] } });
  }

  function addText(isoDate: string, text: string) {
    const existing = plan[isoDate]?.entries ?? [];
    savePlan({ ...plan, [isoDate]: { entries: [...existing, { type: "text", text }] } });
  }

  function removeEntry(isoDate: string, index: number) {
    const existing = plan[isoDate]?.entries ?? [];
    const next = existing.filter((_, i) => i !== index);
    savePlan({ ...plan, [isoDate]: { entries: next } });
  }

  async function handleShare() {
    const text = days
      .map(({ isoDate, shortLabel }) => {
        const entries = plan[isoDate]?.entries ?? [];
        if (entries.length === 0) return null;
        const lines = entries.map((e) => (e.type === "recipe" ? `- ${e.recipeName}` : `- ${e.text}`));
        return `${shortLabel}\n${lines.join("\n")}`;
      })
      .filter(Boolean)
      .join("\n\n");

    if (!text) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "Week plan", text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleExport() {
    const seen = new Set<number>();
    const inputs: ShoppingInput[] = [];
    for (const { isoDate } of days) {
      for (const entry of plan[isoDate]?.entries ?? []) {
        if (entry.type === "recipe" && !seen.has(entry.recipeId)) {
          seen.add(entry.recipeId);
          inputs.push({ recipeId: entry.recipeId, targetPeople: 2 });
        }
      }
    }
    if (inputs.length === 0) return;
    setShoppingResult(null);
    startTransition(async () => {
      const list = await generateShoppingList(inputs);
      setShoppingResult(list);
    });
  }

  const hasAnyEntry = days.some(({ isoDate }) => (plan[isoDate]?.entries ?? []).length > 0);
  const hasAnyRecipe = days.some(({ isoDate }) =>
    (plan[isoDate]?.entries ?? []).some((e) => e.type === "recipe")
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Day cards */}
      {days.map(({ isoDate, longLabel }, i) => (
        <DayCard
          key={isoDate}
          longLabel={longLabel}
          isToday={i === 0}
          entries={plan[isoDate]?.entries ?? []}
          onAddRecipe={() => setModalDate(isoDate)}
          onAddText={(text) => addText(isoDate, text)}
          onRemoveEntry={(index) => removeEntry(isoDate, index)}
        />
      ))}

      {/* Actions */}
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleShare}
          disabled={!hasAnyEntry}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          {copied ? "Copied to clipboard!" : "Share week plan"}
        </button>
        <button
          onClick={handleExport}
          disabled={!hasAnyRecipe || isPending}
          className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {isPending ? "Generating…" : "Export shopping list"}
        </button>
        <button
          onClick={() => {
            const text = days
              .map(({ isoDate, shortLabel }) => {
                const entries = plan[isoDate]?.entries ?? [];
                if (entries.length === 0) return null;
                const lines = entries.map((e) => (e.type === "recipe" ? `- ${e.recipeName}` : `- ${e.text}`));
                return `${shortLabel}\n${lines.join("\n")}`;
              })
              .filter(Boolean)
              .join("\n\n");
            if (!text) return;
            navigator.clipboard.writeText(text);
            setListCopied(true);
            setTimeout(() => setListCopied(false), 2000);
          }}
          disabled={!hasAnyEntry}
          title="Copy week plan to clipboard"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 sm:flex-none"
        >
          {listCopied ? (
            <span className="text-green-600">✓ Copied!</span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy plan
            </>
          )}
        </button>
      </div>

      {/* Shopping list result */}
      {shoppingResult && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 font-semibold text-gray-900">Shopping list</h2>
          <p className="mb-4 text-xs text-gray-400">Based on 2 servings per recipe</p>
          {shoppingResult.length === 0 ? (
            <p className="text-sm text-gray-500">No ingredients found.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {shoppingResult.map((item, i) => (
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

      {/* Add recipe modal */}
      {modalDate && (
        <AddRecipeModal
          recipes={allRecipes}
          onAdd={(selected) => addRecipes(modalDate, selected)}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  );
}
