import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { shekel, useCart } from "@/lib/cart";
import { PRODUCTS } from "@/lib/catalog";

export function CartDrawer() {
  const cart = useCart();
  if (!cart.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => cart.setOpen(false)}
        aria-label="סגירת עגלה"
      />
      <aside className="absolute inset-y-0 end-0 flex w-[26rem] max-w-[92%] flex-col border-s border-border bg-surface shadow-frame">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold text-platinum">עגלת הקנייה</h2>
          <button onClick={() => cart.setOpen(false)} className="rounded-lg p-2 hover:bg-secondary" aria-label="סגירה">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {cart.lines.length === 0 && <p className="text-sm text-muted-foreground">העגלה ריקה כרגע.</p>}
          {cart.lines.map((line) => {
            const p = PRODUCTS.find((x) => x.id === line.productId);
            if (!p) return null;
            return (
              <div key={line.productId} className="flex gap-3 rounded-xl border border-border bg-background/40 p-3">
                <img src={p.image} alt={p.name} width={80} height={80} loading="lazy" className="size-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-snug text-platinum">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{shekel(p.price)} / {p.unit}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => cart.setQty(p.id, line.qty - 1)} className="rounded-md border border-border p-1" aria-label="הפחתה">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-platinum">{line.qty}</span>
                    <button onClick={() => cart.setQty(p.id, line.qty + 1)} className="rounded-md border border-border p-1" aria-label="הוספה">
                      <Plus className="size-3.5" />
                    </button>
                    <button onClick={() => cart.remove(p.id)} className="ms-auto rounded-md p-1 text-muted-foreground hover:text-destructive" aria-label="הסרה">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-border p-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>סה״כ ביניים</span>
            <span className="font-semibold text-platinum">{shekel(cart.subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => cart.setOpen(false)}
            className="block rounded-xl bg-primary px-5 py-3.5 text-center text-sm font-bold text-primary-foreground"
          >
            מעבר לסיום הזמנה
          </Link>
        </div>
      </aside>
    </div>
  );
}
