import { parseIngredient } from "./ingredient-parser";
import type { RecipeDraft } from "./types";

type Json = unknown;
type JsonObject = Record<string, Json>;

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  eacute: "é", egrave: "è", euml: "ë", iuml: "ï", ouml: "ö", uuml: "ü", agrave: "à", ccedil: "ç",
  frac12: "½", frac14: "¼", frac34: "¾", deg: "°", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", hellip: "…",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return isNaN(n) ? m : String.fromCodePoint(n);
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Strips tags and decodes entities (some sites double-encode, so decode twice). */
function cleanText(s: string): string {
  return decodeEntities(decodeEntities(s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ")))
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function isRecipe(node: JsonObject): boolean {
  const t = node["@type"];
  return t === "Recipe" || (Array.isArray(t) && t.includes("Recipe"));
}

/** Depth-first search through JSON-LD (arrays, @graph, nested objects) for a Recipe node. */
function findRecipe(node: Json, depth = 0): JsonObject | null {
  if (depth > 8 || node === null || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findRecipe(n, depth + 1);
      if (r) return r;
    }
    return null;
  }
  const obj = node as JsonObject;
  if (isRecipe(obj)) return obj;
  for (const v of Object.values(obj)) {
    const r = findRecipe(v, depth + 1);
    if (r) return r;
  }
  return null;
}

function asStrings(v: Json): string[] {
  if (v == null) return [];
  if (typeof v === "string") return [v];
  if (typeof v === "number") return [String(v)];
  if (Array.isArray(v)) return v.flatMap(asStrings);
  return [];
}

function parseYield(v: Json): number | null {
  for (const s of asStrings(v)) {
    const m = s.match(/\d+/);
    if (m) {
      const n = parseInt(m[0], 10);
      if (n > 0 && n < 100) return n;
    }
  }
  return null;
}

// Section headings that add nothing ("BEREIDING", "Instructions")
const GENERIC_SECTION = /^(bereiding|bereidingswijze|werkwijze|instructies|instructions|method|directions|steps|stappen)$/i;

/** recipeInstructions can be a string, string[], HowToStep[], or HowToSection[] with nested steps. */
function parseInstructions(v: Json): string {
  const lines: string[] = [];
  let step = 0;

  function walk(node: Json) {
    if (node == null) return;
    if (typeof node === "string") {
      // A single string may hold several paragraphs/steps
      for (const part of cleanText(node).split(/\n+/)) {
        if (part.trim()) lines.push(`${++step}. ${part.trim()}`);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      const obj = node as JsonObject;
      const type = obj["@type"];
      if (type === "HowToSection" || obj.itemListElement) {
        if (typeof obj.name === "string" && obj.name.trim() && !GENERIC_SECTION.test(obj.name.trim())) {
          lines.push("", cleanText(obj.name).toUpperCase());
        }
        walk(obj.itemListElement);
        return;
      }
      const text = typeof obj.text === "string" ? obj.text : typeof obj.name === "string" ? obj.name : "";
      if (text) walk(text);
    }
  }

  walk(v);
  return lines.join("\n").trim();
}

function parseTags(recipe: JsonObject): string[] {
  const raw = [...asStrings(recipe.recipeCategory), ...asStrings(recipe.recipeCuisine)];
  const tags = raw
    .flatMap((s) => s.split(","))
    .map((s) => cleanText(s).toLowerCase())
    .filter((s) => s && s.length <= 30);
  return [...new Set(tags)].slice(0, 6);
}

/** Pulls every <script type="application/ld+json"> block out of the HTML and returns a draft, or null. */
export function extractRecipeFromHtml(html: string, url: string): RecipeDraft | null {
  const scripts = html.matchAll(/<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi);

  for (const [, body] of scripts) {
    let data: Json;
    try {
      data = JSON.parse(body.trim());
    } catch {
      // Some sites put raw newlines/control characters in strings — retry without them
      try {
        data = JSON.parse(body.trim().replace(/[\u0000-\u001f]+/g, " "));
      } catch {
        continue;
      }
    }

    const recipe = findRecipe(data);
    if (!recipe) continue;

    const ingredientLines = asStrings(recipe.recipeIngredient ?? recipe.ingredients)
      .map(cleanText)
      .filter(Boolean);

    return {
      name: cleanText(asStrings(recipe.name)[0] ?? ""),
      tags: parseTags(recipe),
      basePeople: parseYield(recipe.recipeYield),
      link: url,
      instructions: parseInstructions(recipe.recipeInstructions),
      ingredients: ingredientLines.map(parseIngredient),
    };
  }

  return extractMicrodata(html, url);
}

/** Text content of every element with itemprop="prop" (or its content="" attribute for <meta>). */
function itemprops(html: string, prop: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<(\\w+)([^>]*\\bitemprop=["']${prop}["'][^>]*)>`, "gi");
  for (const m of html.matchAll(re)) {
    const [whole, tag, attrs] = m;
    const content = attrs.match(/\bcontent=["']([^"']*)["']/i);
    if (content) {
      out.push(cleanText(content[1]));
      continue;
    }
    const start = m.index! + whole.length;
    const end = html.toLowerCase().indexOf(`</${tag.toLowerCase()}>`, start);
    if (end > start) out.push(cleanText(html.slice(start, end)));
  }
  return out.filter(Boolean);
}

/** Fallback for older sites that mark up recipes with schema.org microdata instead of JSON-LD. */
function extractMicrodata(html: string, url: string): RecipeDraft | null {
  if (!/itemtype=["']https?:\/\/schema\.org\/Recipe["']/i.test(html) && !/itemprop=["']recipeIngredient["']/i.test(html)) {
    return null;
  }
  const ingredientLines = [...itemprops(html, "recipeIngredient"), ...itemprops(html, "ingredients")];
  if (ingredientLines.length === 0) return null;

  return {
    name: itemprops(html, "name")[0] ?? "",
    tags: [...itemprops(html, "recipeCategory"), ...itemprops(html, "recipeCuisine")]
      .map((t) => t.toLowerCase())
      .filter((t) => t.length <= 30)
      .slice(0, 6),
    basePeople: parseYield(itemprops(html, "recipeYield")),
    link: url,
    instructions: parseInstructions(itemprops(html, "recipeInstructions")),
    ingredients: ingredientLines.map(parseIngredient),
  };
}
