"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { importRecipeFromUrl } from "@/actions/import";
import { UNITS } from "@/lib/units";
import type { DraftIngredient, RecipeDraft } from "@/lib/import/types";

type IngredientRow = DraftIngredient;

const EMPTY_ROW: IngredientRow = { name: "", qty: "", unit: "#" };

const inputClass =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function RecipeForm({
  existingTags,
  action,
  initial,
  submitLabel = "Save recipe",
  cancelHref = "/recipes",
  allowImport = false,
}: {
  existingTags: string[];
  action: (formData: FormData) => Promise<void>;
  initial?: RecipeDraft;
  submitLabel?: string;
  cancelHref?: string;
  allowImport?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [basePeople, setBasePeople] = useState(String(initial?.basePeople ?? 2));
  const [link, setLink] = useState(initial?.link ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rows, setRows] = useState<IngredientRow[]>(
    initial?.ingredients.length ? initial.ingredients : [EMPTY_ROW]
  );
  const [servesFlagged, setServesFlagged] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Import state
  const [importUrl, setImportUrl] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<{ flagged: number; duplicate: { id: number; name: string } | null } | null>(null);
  const [importing, startImport] = useTransition();

  function runImport() {
    if (!importUrl.trim()) return;
    setImportError(null);
    setImportNotice(null);
    startImport(async () => {
      const result = await importRecipeFromUrl(importUrl);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      const d = result.draft;
      setName(d.name);
      setLink(d.link);
      setInstructions(d.instructions);
      setTags(d.tags);
      setRows(d.ingredients.length ? d.ingredients : [EMPTY_ROW]);
      if (d.basePeople) setBasePeople(String(d.basePeople));
      setServesFlagged(!d.basePeople);
      setImportNotice({
        flagged: d.ingredients.filter((i) => i.flagged).length + (d.basePeople ? 0 : 1),
        duplicate: result.duplicate,
      });
    });
  }

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
    setRows([...rows, EMPTY_ROW]);
  }

  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: "name" | "qty" | "unit", value: string) {
    // Touching a highlighted row counts as reviewing it
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value, flagged: false } : r)));
  }

  return (
    <div className="flex flex-col gap-6">
      {allowImport && (
        <div className="flex flex-col gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <label htmlFor="import-url" className="text-sm font-medium text-gray-800">
            Import from a link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="import-url"
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); runImport(); }
              }}
              placeholder="Paste a recipe link, e.g. https://dagelijksekost.vrt.be/gerechten/…"
              className={`${inputClass} flex-1 bg-white`}
            />
            <button
              type="button"
              onClick={runImport}
              disabled={importing || !importUrl.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
          {importError && <p className="text-sm text-red-600">{importError}</p>}
          {importNotice && (
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-gray-700">
                Imported. Check everything below before saving
                {importNotice.flagged > 0 && (
                  <>
                    {" "}— <span className="font-medium text-amber-700">{importNotice.flagged} highlighted</span>{" "}
                    {importNotice.flagged === 1 ? "field needs" : "fields need"} a closer look
                  </>
                )}
                .
              </p>
              {importNotice.duplicate && (
                <p className="text-amber-700">
                  You already have this recipe:{" "}
                  <Link href={`/recipes/${importNotice.duplicate.id}`} className="underline">
                    {importNotice.duplicate.name}
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <form action={action} className="flex flex-col gap-6">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
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
                className={`${inputClass} w-full`}
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
            value={basePeople}
            onChange={(e) => { setBasePeople(e.target.value); setServesFlagged(false); }}
            required
            className={`${inputClass} w-24 ${servesFlagged ? "border-amber-400 bg-amber-50" : ""}`}
          />
          {servesFlagged && (
            <p className="text-xs text-amber-700">The page didn&apos;t say how many people this serves.</p>
          )}
        </div>

        {/* Link */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Source link <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* Instructions */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Recipe instructions <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            name="instructions"
            rows={instructions ? 10 : 6}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Steps, tips, notes…"
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* Ingredients */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Ingredients{" "}
            <span className="font-normal text-gray-400">(leave quantity empty for &quot;to taste&quot;)</span>
          </label>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 rounded-lg ${row.flagged ? "border border-amber-300 bg-amber-50 p-2" : ""}`}
            >
              <div className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-center sm:border-0 sm:p-0">
                <input
                  name="ingredientName"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  placeholder="Ingredient"
                  required
                  className={`${inputClass} flex-1 bg-white`}
                />
                <div className="flex gap-2 items-center">
                  <input
                    name="ingredientQty"
                    value={row.qty === "0" ? "" : row.qty}
                    onChange={(e) => updateRow(i, "qty", e.target.value)}
                    placeholder="to taste"
                    type="number"
                    min={0}
                    step="any"
                    className={`${inputClass} w-24 flex-1 bg-white sm:w-24 sm:flex-none`}
                  />
                  <select
                    name="ingredientUnit"
                    value={row.unit}
                    onChange={(e) => updateRow(i, "unit", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:flex-none"
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
              {row.flagged && row.original && (
                <p className="px-1 text-xs text-amber-700">Original: &ldquo;{row.original}&rdquo;</p>
              )}
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
            {submitLabel}
          </button>
          <Link
            href={cancelHref}
            className="rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 sm:py-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
