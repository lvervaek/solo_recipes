import { classifyIngredient, aisleLabel, aisleOrder, type AisleId } from "./grocery";

export type ShoppingAmount = {
  quantity: number; // 0 = to taste
  unit: string;
};

export type ShoppingItem = {
  name: string; // Dutch shopping name
  aisle: AisleId;
  amounts: ShoppingAmount[]; // one per unit family that couldn't be combined (e.g. "2 st. + 100 g")
};

export type RecipeSelection = {
  recipeId: number;
  recipeName: string;
  basePeople: number;
  targetPeople: number;
  ingredients: { name: string; quantity: string; unit: string }[];
};

// Convert to a base unit so amounts in kg + g (or cup + ml) can be added up
const TO_BASE: Record<string, { unit: string; factor: number }> = {
  g: { unit: "g", factor: 1 },
  kg: { unit: "g", factor: 1000 },
  oz: { unit: "g", factor: 28.35 },
  lb: { unit: "g", factor: 453.6 },
  ml: { unit: "ml", factor: 1 },
  L: { unit: "ml", factor: 1000 },
  cup: { unit: "ml", factor: 240 },
  tsp: { unit: "tsp", factor: 1 },
  tbsp: { unit: "tsp", factor: 3 },
};

// You can't buy half an onion or half a can
const ROUND_UP = new Set(["#", "clove", "can", "pack", "bunch", "slice"]);

export function buildShoppingList(selections: RecipeSelection[]): ShoppingItem[] {
  // name → unit → total
  const grouped = new Map<string, { aisle: AisleId; totals: Map<string, number> }>();

  for (const sel of selections) {
    const multiplier = sel.targetPeople / sel.basePeople;
    for (const ing of sel.ingredients) {
      const scaledQty = parseFloat(ing.quantity) * multiplier || 0;
      const info = classifyIngredient(ing.name, ing.unit, scaledQty);
      if (info.skip) continue;

      const base = TO_BASE[ing.unit] ?? { unit: ing.unit, factor: 1 };
      const group = grouped.get(info.name) ?? { aisle: info.aisle, totals: new Map() };
      group.totals.set(base.unit, (group.totals.get(base.unit) ?? 0) + scaledQty * base.factor);
      grouped.set(info.name, group);
    }
  }

  const items: ShoppingItem[] = [];
  for (const [name, { aisle, totals }] of grouped) {
    let amounts = [...totals].map(([unit, quantity]) => ({ unit, quantity }));
    // "to taste" only matters if nothing else asks for an actual amount
    if (amounts.some((a) => a.quantity > 0)) amounts = amounts.filter((a) => a.quantity > 0);
    else amounts = [{ unit: "#", quantity: 0 }];
    items.push({ name, aisle, amounts: amounts.map(toDisplayUnit) });
  }

  return items.sort(
    (a, b) => aisleOrder(a.aisle) - aisleOrder(b.aisle) || a.name.localeCompare(b.name, "nl")
  );
}

/** Pick a readable unit for a summed base amount: 1500 g → 1.5 kg, 9 tsp → 3 tbsp. */
function toDisplayUnit({ unit, quantity }: ShoppingAmount): ShoppingAmount {
  if (quantity === 0) return { unit, quantity };
  if (unit === "g") return quantity >= 1000 ? { unit: "kg", quantity: round(quantity / 1000, 2) } : { unit, quantity: Math.ceil(quantity) };
  if (unit === "ml") return quantity >= 1000 ? { unit: "L", quantity: round(quantity / 1000, 2) } : { unit, quantity: Math.ceil(quantity) };
  if (unit === "tsp") return quantity >= 3 ? { unit: "tbsp", quantity: Math.ceil((quantity / 3) * 2) / 2 } : { unit, quantity: round(quantity, 2) };
  if (ROUND_UP.has(unit)) return { unit, quantity: Math.ceil(quantity - 0.001) };
  return { unit, quantity: round(quantity, 2) };
}

function round(n: number, decimals: number): number {
  return parseFloat(n.toFixed(decimals));
}

export function formatQuantity(qty: number): string {
  // Show up to 2 decimal places, strip trailing zeros
  return parseFloat(qty.toFixed(2)).toString();
}

/** "200 g", or "to taste" for quantity 0 (e.g. salt and pepper). Used on recipe pages. */
export function formatAmount(qty: number, unit: string): string {
  if (!qty) return "to taste";
  return `${formatQuantity(qty)} ${unit}`;
}

// Dutch unit labels for the shopping list: [singular, plural]
const NL_UNITS: Record<string, [string, string]> = {
  "#": ["st.", "st."],
  g: ["g", "g"],
  kg: ["kg", "kg"],
  ml: ["ml", "ml"],
  L: ["l", "l"],
  tsp: ["tl", "tl"],
  tbsp: ["el", "el"],
  pinch: ["snuifje", "snuifjes"],
  clove: ["teentje", "teentjes"],
  bunch: ["bosje", "bosjes"],
  slice: ["sneetje", "sneetjes"],
  can: ["blik", "blikken"],
  pack: ["pak", "pakken"],
};

/** "2 st. + 100 g", or "naar smaak". */
export function formatShoppingAmounts(amounts: ShoppingAmount[]): string {
  if (amounts.every((a) => !a.quantity)) return "naar smaak";
  return amounts
    .map(({ quantity, unit }) => {
      const [one, many] = NL_UNITS[unit] ?? [unit, unit];
      return `${formatQuantity(quantity).replace(".", ",")} ${quantity === 1 ? one : many}`;
    })
    .join(" + ");
}

export function groupByAisle(items: ShoppingItem[]): { aisle: AisleId; label: string; items: ShoppingItem[] }[] {
  const groups: { aisle: AisleId; label: string; items: ShoppingItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last?.aisle === item.aisle) last.items.push(item);
    else groups.push({ aisle: item.aisle, label: aisleLabel(item.aisle), items: [item] });
  }
  return groups;
}

/** Plain-text version for copy/share, with aisle headings. */
export function shoppingListToText(items: ShoppingItem[]): string {
  return groupByAisle(items)
    .map((g) => `${g.label}\n${g.items.map((i) => `- ${i.name}: ${formatShoppingAmounts(i.amounts)}`).join("\n")}`)
    .join("\n\n");
}
