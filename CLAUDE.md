@AGENTS.md

# Soloteam Recipes

Personal recipe app for Loic and Sofie. Next.js 16 App Router + Neon Postgres, deployed on Vercel.

## Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Database**: Neon Postgres via `@neondatabase/serverless`, accessed with Drizzle ORM
- **Auth**: NextAuth v5 beta — credentials provider, 2 hardcoded users (no user table)
- **Styling**: Tailwind CSS v4 (no component library)

## Architecture

- Server components fetch data directly from the DB; client components handle interactivity
- Mutations use Next.js Server Actions (in `actions/`)
- Week plan state is stored in `localStorage` (ephemeral, no DB table needed)

## Key files

- `lib/schema.ts` — Drizzle schema: `recipes` (id, name, tags[], basePeople, link, instructions) + `ingredients` (recipeId FK, name, quantity, unit, sortOrder)
- `lib/auth.ts` — NextAuth config; users read from `USER_LOIC_HASH` / `USER_SOFIE_HASH` env vars **inside** the `authorize` function (not at module level, to avoid edge runtime issues)
- `lib/shopping.ts` — Pure shopping list calculation: scales quantities by `targetPeople / basePeople`, translates/merges names via `lib/grocery.ts`, converts units (kg→g, L/cup→ml, tbsp→tsp) to combine amounts, sorts by aisle. Dutch output ("naar smaak", el/tl)
- `lib/grocery.ts` — Built-in EN/NL ingredient dictionary → Dutch shopping name + supermarket aisle (no AI, by user choice). Unknown names go to "Overig"; add a line to `DICTIONARY` to teach it new ones
- `lib/planning.ts` — Week plan types and `buildDayWindow()` helper (today + 7 days)
- `lib/import/` — URL recipe import: `fetch.ts` (server-side fetch, blocks private IPs, manual redirects), `jsonld.ts` (schema.org Recipe from JSON-LD, microdata fallback), `ingredient-parser.ts` (splits "200 gr bloem" into qty/unit/name, Dutch + English units, cleans names, flags unsure rows). No AI — sites without recipe data can't be imported.
- `components/recipe-form.tsx` — Shared by new + edit; controlled fields so an import draft can fill them. Quantity 0/empty = "to taste" (`formatAmount` in `lib/shopping.ts`)
- `middleware.ts` — Protects all routes except `/login` using NextAuth `auth`

## Env vars (`.env.local`)

```
DATABASE_URL=           # Neon connection string
AUTH_SECRET=            # Random base64 string (openssl rand -base64 32 or node crypto)
USER_LOIC_HASH=         # bcrypt hash — wrap in \$escaped dollars in .env.local
USER_SOFIE_HASH=        # bcrypt hash — wrap in \$escaped dollars in .env.local
```

**Important**: bcrypt hashes contain `$` signs which Next.js expands as env vars. Escape them as `\$` in `.env.local`. In Vercel dashboard, paste raw (no escaping needed).

## DB commands

```bash
npm run db:push    # Push schema changes to Neon
npm run db:studio  # Open Drizzle Studio
npm run hash-password <password>  # Generate bcrypt hash for a user
```

## Pages

| Route | Description |
|---|---|
| `/recipes` | Recipe list with search (name + tags) |
| `/recipes/new` | Add recipe — import from link, dynamic ingredient rows, tag autocomplete from DB |
| `/recipes/[id]` | Recipe detail + edit/delete |
| `/recipes/[id]/edit` | Edit recipe (same form, replaces ingredient rows) |
| `/shopping` | Select recipes + serving count → combined shopping list |
| `/planning` | 7-day week planner with recipe/text entries, share + export |
