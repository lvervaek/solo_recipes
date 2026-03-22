"use client";

import { useState, useRef } from "react";
import { createRecipe } from "@/actions/recipes";
import { UNITS } from "@/lib/units";

type IngredientRow = { name: string; qty: string; unit: string };

export default function RecipeForm({ existingTags }: { existingTags: string[] }) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rows, setRows] = useState<IngredientRow[]>([{ name: "", qty: "", unit: "#" }]);
  const tagInputRef = useRef<HTMLInputElement>(null);

  function onTagInputChange(value: string) {
    setTagInput(value);
    if (value.trim()) {
      const lower = value.toLowerCase();
      setSuggestions(
        existingTags.filter(
          (t) => t.toLowerCase().includes(lower) && !tags.includes(t)
        )
      );
    } else {
      setSuggestions([]);
    }
  }

  function addTag(tag?: string) {
    const t = (tag ?? tagInput).trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
    setSuggestions([]);
    tagInputRef.current?.focus();
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  function addRow() {
    setRows([...rows, { name: "", qty: "", unit: "#" }]);
  }

  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof IngredientRow, value: string) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  return (
    <form action={createRecipe} className="flex flex-col gap-6">
      {/* Hidden tag inputs submitted with form */}
      {tags.map((t) => (
        <input key={t} type="hidden" name="tags" value={t} />
      ))}

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Recipe name</label>
        <input
          name="name"
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(); }
                if (e.key === "Escape") setSuggestions([]);
              }}
              placeholder="e.g. pasta, quick, vegetarian"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md">
                {suggestions.map((s) => (
                  <li
                    key={s}
                    onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                    className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => addTag()}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-indigo-900">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Base servings */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Serves (base amount)</label>
        <input
          name="basePeople"
          type="number"
          min={1}
          defaultValue={2}
          required
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Link */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Source link <span className="text-gray-400">(optional)</span>
        </label>
        <input
          name="link"
          type="url"
          placeholder="https://..."
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Recipe instructions <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          name="instructions"
          rows={6}
          placeholder="Steps, tips, notes…"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
        />
      </div>

      {/* Ingredients */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Ingredients</label>
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-center sm:border-0 sm:p-0">
            <input
              name="ingredientName"
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
              placeholder="Ingredient"
              required
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex gap-2 items-center">
              <input
                name="ingredientQty"
                value={row.qty}
                onChange={(e) => updateRow(i, "qty", e.target.value)}
                placeholder="Qty"
                type="number"
                min={0}
                step="any"
                required
                className="w-24 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-20 sm:flex-none"
              />
              <select
                name="ingredientUnit"
                value={row.unit}
                onChange={(e) => updateRow(i, "unit", e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:flex-none"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="shrink-0 text-gray-400 hover:text-red-500 text-xl leading-none px-1 py-1"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="self-start text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Add ingredient
        </button>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 sm:py-2"
        >
          Save recipe
        </button>
        <a
          href="/recipes"
          className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 sm:py-2"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
