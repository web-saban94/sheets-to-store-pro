import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { BRANDS, CATEGORIES, PRODUCTS } from "@/lib/catalog";

type CatalogSearch = { category?: string | undefined };

export const Route = createFileRoute("/catalog")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "קטלוג מוצרים | ח. סבן חומרי בניין" },
      {
        name: "description",
        content:
          "קטלוג חומרי בניין, צבעים, איטום וכלי עבודה עם נתוני כיסוי למ״ר, זמן ייבוש ושיטת יישום.",
      },
      { property: "og:title", content: "קטלוג מוצרים | ח. סבן חומרי בניין" },
      {
        property: "og:description",
        content: "מאות פריטים מקצועיים עם מפרט טכני מלא והזמנה אונליין.",
      },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/catalog" });
  const [brand, setBrand] = useState("all");
  const [query, setQuery] = useState("");

  const products = PRODUCTS.filter(
    (p) =>
      (!category || p.categoryId === category) &&
      (brand === "all" || p.brand === brand) &&
      (query.trim() === "" || (p.name + p.description + p.sku).includes(query.trim())),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black text-platinum sm:text-4xl">קטלוג מוצרים</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        כל מוצר כולל מפרט טכני: זמן ייבוש, כיסוי למ״ר ושיטת יישום.
      </p>

      <div className="frame mt-6 flex flex-wrap items-center gap-3 p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מוצר או מק״ט"
          className="min-w-52 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="all">כל המותגים</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ search: {} })}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            !category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-platinum"
          }`}
        >
          הכל
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate({ search: { category: c.id } })}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              category === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-platinum"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          לא נמצאו מוצרים תואמים. נסו חיפוש אחר.
        </p>
      )}
    </div>
  );
}
