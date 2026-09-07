import { Clock, Droplets, Layers, Plus } from "lucide-react";
import { useState } from "react";
import { shekel, useCart } from "@/lib/cart";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const [added, setAdded] = useState(false);

  return (
    <article className="frame group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
        <img
          src={product.image}
          alt={product.name}
          width={800}
          height={600}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.promo && (
          <span className="absolute top-3 start-3 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
            {product.promo}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-3 end-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold text-muted-foreground">
            אזל זמנית
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-semibold tracking-wider text-primary">
          {product.brand}
        </span>
        <h3 className="mt-1 text-base font-bold leading-snug text-platinum">{product.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <dl className="mt-4 space-y-2 rounded-lg border border-border bg-background/40 p-3 text-xs">
          <div className="flex gap-2 text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <dt className="inline font-semibold text-platinum">זמן ייבוש: </dt>
              <dd className="inline">{product.dryingTime}</dd>
            </span>
          </div>
          <div className="flex gap-2 text-muted-foreground">
            <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <dt className="inline font-semibold text-platinum">כיסוי: </dt>
              <dd className="inline">{product.coverage}</dd>
            </span>
          </div>
          <div className="flex gap-2 text-muted-foreground">
            <Droplets className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <dt className="inline font-semibold text-platinum">שיטת יישום: </dt>
              <dd className="inline">{product.application}</dd>
            </span>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <span className="text-xl font-black text-platinum">{shekel(product.price)}</span>
            <span className="text-xs text-muted-foreground"> / {product.unit}</span>
          </div>
          <button
            disabled={!product.inStock}
            onClick={() => {
              cart.add(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Plus className="size-4" />
            {added ? "נוסף!" : "הוספה"}
          </button>
        </div>
      </div>
    </article>
  );
}
