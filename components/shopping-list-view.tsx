import { formatShoppingAmounts, groupByAisle, type ShoppingItem } from "@/lib/shopping";

/** Shopping list grouped under aisle headings, in store order. */
export default function ShoppingListView({ items }: { items: ShoppingItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No ingredients found.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {groupByAisle(items).map((group) => (
        <section key={group.aisle}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">{group.label}</h3>
          <ul className="flex flex-col gap-2">
            {group.items.map((item) => (
              <li key={item.name} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm">
                <span className="text-gray-800">{item.name}</span>
                <span className="shrink-0 text-gray-500">{formatShoppingAmounts(item.amounts)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
