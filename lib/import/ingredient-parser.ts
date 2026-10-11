import type { DraftIngredient } from "./types";

// Maps unit words (Dutch + English, lowercase) to our unit values.
// `factor` converts e.g. cl → ml.
// `vague` units ("een scheutje") are imported as pieces but flagged for review.
const UNIT_ALIASES: Record<string, { unit: string; factor?: number; vague?: boolean }> = {};

function alias(unit: string, words: string[], factor?: number, vague?: boolean) {
  for (const w of words) UNIT_ALIASES[w] = { unit, factor, vague };
}

alias("g", ["g", "gr", "gram", "grams", "gramme", "grammes"]);
alias("kg", ["kg", "kilo", "kilos", "kilogram", "kilograms"]);
alias("ml", ["ml", "milliliter", "milliliters", "millilitre", "millilitres"]);
alias("ml", ["cl", "centiliter", "centiliters"], 10);
alias("ml", ["dl", "deciliter", "deciliters"], 100);
alias("L", ["l", "liter", "liters", "litre", "litres"]);
alias("tbsp", ["el", "eetlepel", "eetlepels", "eetl", "tbsp", "tbs", "tablespoon", "tablespoons"]);
alias("tsp", ["tl", "theelepel", "theelepels", "theel", "koffielepel", "koffielepels", "kl", "tsp", "teaspoon", "teaspoons"]);
alias("cup", ["cup", "cups", "kop", "kopje", "kopjes", "kopp", "koppen"]);
alias("oz", ["oz", "ounce", "ounces"]);
alias("lb", ["lb", "lbs", "pound", "pounds"]);
alias("pinch", ["snuifje", "snuifjes", "snufje", "snufjes", "snuf", "mespunt", "mespuntje", "pinch", "pinches", "dash", "sprinkle", "sprinkles"]);
alias("clove", ["teen", "teentje", "teentjes", "tenen", "clove", "cloves"]);
alias("bunch", ["bos", "bosje", "bosjes", "bossen", "bunch", "bunches"]);
alias("slice", ["plak", "plakje", "plakjes", "plakken", "sneetje", "sneetjes", "snede", "sneden", "slice", "slices"]);
alias("can", ["blik", "blikje", "blikjes", "blikken", "can", "cans", "tin", "tins"]);
alias("pack", ["pak", "pakje", "pakjes", "pakken", "zak", "zakje", "zakjes", "doos", "doosje", "bakje", "bakjes", "pot", "potje", "pack", "packs", "package", "packages", "packet", "packets", "bag", "jar"]);
alias("#", ["stuk", "stuks", "stukken", "piece", "pieces", "st"]);
alias("#", ["stronk", "stronkje", "stronkjes", "stronken", "takje", "takjes", "takken", "stengel", "stengels", "stengeltje", "stengeltjes",
  "blaadje", "blaadjes", "blokje", "blokjes", "krop", "kropje", "kroppen", "sprig", "sprigs", "stalk", "stalks", "head", "heads"]);
alias("#", ["handje", "handjes", "handvol", "scheut", "scheutje", "scheutjes", "beetje", "klontje", "klontjes", "klont",
  "druppel", "druppels", "handful", "handfuls", "splash", "knob", "drizzle"], undefined, true);

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
  "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8, "⅙": 1 / 6, "⅚": 5 / 6, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

const TO_TASTE = /\b(naar smaak|naar wens|to taste|as needed|optioneel|optional|eventueel|evt\.?)\b/i;

// Preparation words stripped from the front of a name ("fijngesneden ui" → "ui").
// Deliberately conservative: words like "gehakt" (= mince) or "minced" are not in here.
const PREP_PREFIXES = [
  "fijngesneden", "fijngesnipperde", "fijngesnipperd", "gesnipperde", "gesnipperd", "gesneden",
  "geraspte", "geraspt", "geperste", "geperst", "gehakte", "grofgehakte", "fijngehakte",
  "grote", "groot", "kleine", "klein", "middelgrote", "large", "small", "medium",
  "verse", "vers", "gedroogde", "bevroren", "ontdooide", "gekookte", "geschilde", "ongezouten", "gezouten",
  "finely chopped", "roughly chopped", "chopped", "diced", "sliced", "grated", "crushed", "fresh", "dried", "frozen",
];

/** Parses "1 1/2", "1½", "1,5", "2-3" (→ 3) at the start of the string. */
function parseQuantity(s: string): { qty: number; rest: string } | null {
  let str = s.replace(/^\s+/, "");
  const num = String.raw`\d+(?:[.,]\d+)?`;
  const frac = String.raw`\d+\s*\/\s*\d+`;
  const uni = `[${Object.keys(UNICODE_FRACTIONS).join("")}]`;
  const single = `(?:${num}\\s*${uni}|${num}\\s+${frac}|${frac}|${num}|${uni})`;
  const range = new RegExp(`^(${single})(?:\\s*(?:-|–|à|a|tot|to|or|of)\\s*(${single}))?(?=$|[^\\d])`, "i");

  const m = str.match(range);
  if (!m) return null;
  const value = toNumber(m[2] ?? m[1]);
  if (value === null) return null;
  str = str.slice(m[0].length);
  return { qty: value, rest: str };
}

function toNumber(token: string): number | null {
  const t = token.trim();
  let total = 0;
  // whole + unicode fraction: "1½"
  const uniMatch = t.match(/^(\d+(?:[.,]\d+)?)?\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
  if (uniMatch) {
    if (uniMatch[1]) total += parseFloat(uniMatch[1].replace(",", "."));
    total += UNICODE_FRACTIONS[uniMatch[2]];
    return total;
  }
  // whole + fraction: "1 1/2"
  const mixed = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return parseInt(frac[2]) === 0 ? null : parseInt(frac[1]) / parseInt(frac[2]);
  const n = parseFloat(t.replace(",", "."));
  return isNaN(n) ? null : n;
}

function cleanName(raw: string): string {
  let name = raw
    .replace(/\([^)]*\)/g, " ") // (geperst), (about 200 g)
    .replace(/\[[^\]]*\]/g, " ")
    .replace(TO_TASTE, " ")
    .split(/[,;]| - | – | plus | om te serveren| voor erbij| to serve| for serving/i)[0] // drop ", fijngesnipperd"
    .replace(/\s+/g, " ")
    .trim();

  // Strip "van de"/"of" leftovers: "200 g van de bloem"
  name = name.replace(/^(van de|van het|van|of the|of)\s+/i, "");

  // Strip preparation words at the front (repeat: "verse fijngesneden peterselie")
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of PREP_PREFIXES) {
      const re = new RegExp(`^${p}\\s+`, "i");
      if (re.test(name) && name.replace(re, "").trim().length > 0) {
        name = name.replace(re, "");
        changed = true;
      }
    }
  }
  name = name.replace(/[.:]+$/, "").trim();
  return name.toLowerCase();
}

function formatQty(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}

/** Parses a segment that is *only* an amount: "225 g", "1", "a drizzle". Returns null otherwise. */
function parseAmountOnly(segment: string): { qty: number; unit: string; vague: boolean } | null {
  const s = segment.trim();
  let qty: number;
  let rest: string;
  const q = parseQuantity(s);
  if (q) {
    qty = q.qty;
    rest = q.rest.trim();
  } else {
    const article = s.match(/^(een|a|an)\s+/i);
    if (!article) return null;
    qty = 1;
    rest = s.slice(article[0].length).trim();
  }
  if (!rest) return { qty, unit: "#", vague: false };
  const def = UNIT_ALIASES[rest.toLowerCase().replace(/\.$/, "")];
  if (!def) return null;
  return { qty: def.factor ? qty * def.factor : qty, unit: def.unit, vague: !!def.vague };
}

export function parseIngredient(line: string): DraftIngredient {
  const original = line.replace(/\s+/g, " ").trim();

  // Amount after the name: "Black Beans, 60 g", "Salt, a sprinkle" (e.g. Cookwell)
  const lastComma = original.lastIndexOf(",");
  if (lastComma > 0) {
    const amount = parseAmountOnly(original.slice(lastComma + 1));
    const name = cleanName(original.slice(0, lastComma));
    if (amount && name) {
      return {
        name,
        qty: formatQty(amount.qty),
        unit: amount.unit,
        flagged: amount.vague || undefined,
        original,
      };
    }
  }

  let rest = original;
  let qty: number | null = null;
  let unit = "#";
  let unitFound = false;
  let vague = false;

  const q = parseQuantity(rest);
  if (q) {
    qty = q.qty;
    rest = q.rest;
  } else {
    // "een snuifje zout", "a pinch of salt"
    const article = rest.match(/^(een|a|an)\s+(\S+)/i);
    if (article && UNIT_ALIASES[article[2].toLowerCase().replace(/\.$/, "")]) {
      qty = 1;
      rest = rest.slice(article[1].length);
    }
  }

  // "1 (14 oz) can chickpeas" — drop a size note between amount and unit
  rest = rest.replace(/^\s*\([^)]*\)/, "");

  // Unit: first word, possibly glued to the number ("200g")
  const unitMatch = rest.match(/^\s*([a-zA-Zéë]+)\.?(?=\s|$)/);
  if (unitMatch) {
    const word = unitMatch[1].toLowerCase();
    const def = UNIT_ALIASES[word];
    const after = rest.slice(unitMatch[0].length).trim();
    // Only treat as unit if something follows ("1 l" alone is odd; "2 teentjes knoflook" is fine)
    if (def && after.length > 0) {
      unit = def.unit;
      if (qty !== null && def.factor) qty *= def.factor;
      unitFound = true;
      vague = !!def.vague;
      rest = after;
    }
  }

  // "snuifje cayennepeper" — a unit without a number means one of it
  if (qty === null && unitFound) qty = 1;

  const name = cleanName(rest) || cleanName(original);
  const toTaste = TO_TASTE.test(original);

  let flagged = false;
  if (qty === null) {
    // No amount: fine if the source said "naar smaak", otherwise worth a look
    flagged = !toTaste;
  }
  if (!name || vague) flagged = true;

  return {
    name,
    qty: qty === null ? "0" : formatQty(qty),
    unit,
    flagged: flagged || undefined,
    original,
  };
}
