export type RecipeEntry = {
  type: "recipe";
  recipeId: number;
  recipeName: string;
};

export type TextEntry = {
  type: "text";
  text: string;
};

export type PlanEntry = RecipeEntry | TextEntry;

export type DayPlan = {
  entries: PlanEntry[];
};

export type WeekPlanStore = {
  [isoDate: string]: DayPlan;
};

export type DayInfo = {
  isoDate: string;   // "2025-02-23"
  longLabel: string; // "Monday 23/02"
  shortLabel: string; // "Mon 23/02"
};

export function buildDayWindow(): DayInfo[] {
  const days: DayInfo[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const shortDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const longDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const isoDate = `${d.getFullYear()}-${mm}-${dd}`;
    const dateStr = `${dd}/${mm}`;
    const dow = d.getDay();

    days.push({
      isoDate,
      longLabel: `${longDay[dow]} ${dateStr}`,
      shortLabel: `${shortDay[dow]} ${dateStr}`,
    });
  }

  return days;
}
