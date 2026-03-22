"use client";

export default function DeleteRecipeButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        onClick={(e) => {
          if (!confirm("Delete this recipe?")) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
