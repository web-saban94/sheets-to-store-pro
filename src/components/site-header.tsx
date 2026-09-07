import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, User, X, Phone } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/catalog";

const NAV = [
  { to: "/", label: "בית" },
  { to: "/catalog", label: "קטלוג" },
  { to: "/checkout", label: "סיום הזמנה" },
  { to: "/account", label: "אזור אישי" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const cart = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <button
          className="rounded-lg border border-border p-2 text-platinum md:hidden"
          onClick={() => setOpen(true)}
          aria-label="פתיחת תפריט"
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-lg font-black text-primary-foreground">
            ח.ס
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold text-platinum">ח. סבן חומרי בניין</span>
            <span className="block text-[11px] text-muted-foreground">(1994) בע״מ · הוד השרון</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-platinum"
              activeProps={{ className: "bg-secondary text-platinum" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <a
            href="tel:097000000"
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-platinum transition-colors hover:bg-secondary sm:flex"
          >
            <Phone className="size-4" /> 09-7000000
          </a>
          <Link
            to="/account"
            className="rounded-lg border border-border p-2 text-platinum transition-colors hover:bg-secondary"
            aria-label="אזור אישי"
          >
            <User className="size-5" />
          </Link>
          <button
            onClick={() => cart.setOpen(true)}
            className="relative rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-opacity hover:opacity-90"
            aria-label="עגלת קניות"
          >
            <ShoppingCart className="size-5" />
            {cart.count > 0 && (
              <span className="absolute -top-2 -start-2 grid size-5 place-items-center rounded-full bg-platinum text-[11px] font-bold text-background">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="סגירת תפריט"
          />
          <aside className="absolute inset-y-0 start-0 w-80 max-w-[85%] border-e border-border bg-surface p-5 shadow-frame">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-platinum">תפריט</span>
              <button onClick={() => setOpen(false)} aria-label="סגירה" className="rounded-lg p-2 hover:bg-secondary">
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-6 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-platinum hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              קטגוריות
            </p>
            <nav className="mt-2 space-y-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to="/catalog"
                  search={{ category: c.id }}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-platinum"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
