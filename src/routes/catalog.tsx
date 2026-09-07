import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useTransition } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { BRANDS, CATEGORIES, PRODUCTS, type Product } from "@/lib/catalog";
import { fetchLiveCatalog } from "@/lib/sheets.functions";

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
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);
  const [isRefreshing, startRefresh] = useTransition();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const loadLiveProducts = async () => {
    try {
      const res = await fetchLiveCatalog();
      if (res && res.ok && Array.isArray(res.products) && res.products.length > 0) {
        // Merge with static products: override existing or add new
        const merged = PRODUCTS.map((base) => {
          const remote = res.products?.find(
            (r) =>
              (r.sku && r.sku === base.sku) || (r.id && r.id === base.id) || r.name === base.name,
          );
          if (!remote) return base;
          return {
            ...base,
            name: remote.name || base.name,
            price: Number(remote.price) > 0 ? Number(remote.price) : base.price,
            inStock: typeof remote.inStock === "boolean" ? remote.inStock : base.inStock,
            unit: remote.unit || base.unit,
            description: remote.description || base.description,
            promo: remote.promo !== undefined ? remote.promo : base.promo,
            image: remote.imageUrl || base.image,
            dryingTime: remote.dryingTime || base.dryingTime,
            coverage: remote.coverage || base.coverage,
            application: remote.application || base.application,
            brand: remote.brand || base.brand,
            categoryId: remote.categoryId || base.categoryId,
          };
        });

        // Add any products created purely in the Google Sheet
        const existingSkus = new Set(merged.map((m) => m.sku));
        for (const r of res.products) {
          if (r.sku && !existingSkus.has(r.sku) && r.name) {
            merged.push({
              id: r.id || `sheet-${r.sku}`,
              sku: r.sku,
              name: r.name,
              brand: r.brand || "ח. סבן",
              categoryId: r.categoryId || "building",
              price: Number(r.price) || 0,
              unit: r.unit || "יחידה",
              image: r.imageUrl || PRODUCTS[0].image,
              description: r.description || "",
              dryingTime: r.dryingTime || "",
              coverage: r.coverage || "",
              application: r.application || "",
              promo: r.promo || "",
              inStock: typeof r.inStock === "boolean" ? r.inStock : true,
            });
          }
        }
        setLiveProducts(merged);
        setLastSyncTime(
          new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        );
      }
    } catch {
      // Keep static fallback
    }
  };

  useEffect(() => {
    loadLiveProducts();
    // Poll every 45 seconds for changes in Google Sheet
    const interval = setInterval(loadLiveProducts, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    startRefresh(async () => {
      await loadLiveProducts();
    });
  };

  const dynamicBrands = useMemo(() => {
    const brandsSet = new Set(BRANDS);
    liveProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [liveProducts]);

  const filteredProducts = liveProducts.filter(
    (p) =>
      (!category || p.categoryId === category) &&
      (brand === "all" || p.brand === brand) &&
      (query.trim() === "" || (p.name + p.description + p.sku).includes(query.trim())),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-platinum sm:text-4xl">קטלוג מוצרים</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            כל מוצר כולל מפרט טכני: זמן ייבוש, כיסוי למ״ר ושיטת יישום.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              מסונכרן לגיליון ({lastSyncTime})
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-platinum shadow-sm transition hover:bg-secondary disabled:opacity-50"
            title="רענן נתונים עדכניים מגוגל שיטס"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            {isRefreshing ? "מרענן מהגיליון..." : "רענון מהגיליון"}
          </button>
        </div>
      </div>

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
          {dynamicBrands.map((b) => (
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
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          לא נמצאו מוצרים תואמים. נסו חיפוש אחר.
        </p>
      )}
    </div>
  );
}
