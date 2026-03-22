import { db } from "@/lib/db";
import { recipes } from "@/lib/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import WeekPlanner from "@/components/week-planner";

export default async function PlanningPage() {
  const allRecipes = await db.select().from(recipes).orderBy(asc(recipes.name));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Week planning</h1>
        <Link href="/recipes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Recipes
        </Link>
      </div>
      <WeekPlanner allRecipes={allRecipes} />
    </div>
  );
}
