import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tags: text("tags").array().notNull().default([]),
  basePeople: integer("base_people").notNull(),
  link: text("link"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;
