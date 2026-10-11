export type DraftIngredient = {
  name: string;
  qty: string; // "" or "0" means "to taste"
  unit: string;
  flagged?: boolean; // parser wasn't confident — highlight for review
  original?: string; // the raw line from the source, shown as a hint
};

export type RecipeDraft = {
  name: string;
  tags: string[];
  basePeople: number | null; // null = not found on the page
  link: string;
  instructions: string;
  ingredients: DraftIngredient[];
};
