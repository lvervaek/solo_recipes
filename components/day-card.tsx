"use client";

import { useState } from "react";
import type { PlanEntry } from "@/lib/planning";

type Props = {
  longLabel: string;
  isToday: boolean;
  entries: PlanEntry[];
  onAddRecipe: () => void;
  onAddText: (text: string) => void;
  onRemoveEntry: (index: number) => void;
};

export default function DayCard({ longLabel, isToday, entries, onAddRecipe, onAddText, onRemoveEntry }: Props) {
  const [textMode, setTextMode] = useState(false);
  const [textValue, setTextValue] = useState("");

  function submitText() {
    const t = textValue.trim();
    if (t) onAddText(t);
    setTextValue("");
    setTextMode(false);
  }

  return (
    <div className={`rounded-xl border bg-white p-4 ${isToday ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200"}`}>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-semibold text-gray-900">{longLabel}</h2>
        {isToday && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">Today</span>
        )}
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {entries.map((entry, i) => (
            <li key={i} className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-800">
                {entry.type === "recipe" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-indigo-400">🍽</span>
                    {entry.recipeName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-400">📝</span>
                    {entry.text}
                  </span>
                )}
              </span>
              <button
                onClick={() => onRemoveEntry(i)}
                className="shrink-0 text-gray-300 hover:text-red-400 text-base leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add text inline input */}
      {textMode ? (
        <div className="mb-3 flex gap-2">
          <input
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); submitText(); }
              if (e.key === "Escape") { setTextMode(false); setTextValue(""); }
            }}
            placeholder="Add a note…"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={submitText}
            className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Add
          </button>
          <button
            onClick={() => { setTextMode(false); setTextValue(""); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onAddRecipe}
            className="flex-1 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            + Recipe
          </button>
          <button
            onClick={() => setTextMode(true)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            + Text
          </button>
        </div>
      )}
    </div>
  );
}
