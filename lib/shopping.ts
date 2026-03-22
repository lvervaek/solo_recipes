export type ShoppingItem = {
  name: string;
  quantity: number;
  unit: string;
};

export type RecipeSelection = {
  recipeId: number;
  recipeName: string;
  basePeople: number;
  targetPeople: number;
  ingredients: { name: string; quantity: string; unit: string }[];
};

export function buildShoppingList(selections: RecipeSelection[]): ShoppingItem[] {
  const grouped = new Map<string, ShoppingItem>();

  for (const sel of selections) {
    const multiplier = sel.targetPeople / sel.basePeople;
    for (const ing of sel.ingredients) {
      const scaledQty = parseFloat(ing.quantity) * multiplier;
      const key = `${ing.name.toLowerCase().trim()}__${ing.unit}`;
      const existing = grouped.get(key);
      if (existing) {
        grouped.set(key, { ...existing, quantity: existing.quantity + scaledQty });
      } else {
        grouped.set(key, {
          name: ing.name.trim(),
          quantity: scaledQty,
          unit: ing.unit,
        });
      }
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function formatQuantity(qty: number): string {
  // Show up to 2 decimal places, strip trailing zeros
  return parseFloat(qty.toFixed(2)).toString();
}
