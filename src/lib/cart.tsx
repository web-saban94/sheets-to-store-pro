import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { COUPONS, PRODUCTS, type Product } from "@/lib/catalog";

export type CartLine = { productId: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  delivery: boolean;
  setDelivery: (v: boolean) => void;
  crane: boolean;
  setCrane: (v: boolean) => void;
  coupon: string;
  setCoupon: (v: string) => void;
  discount: number;
  deliveryCost: number;
  craneCost: number;
  vat: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const DELIVERY_COST = 180;
const CRANE_COST = 350;

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "saban-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [delivery, setDelivery] = useState(false);
  const [crane, setCrane] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLines(parsed.lines ?? []);
        setDelivery(!!parsed.delivery);
        setCrane(!!parsed.crane);
        setCoupon(parsed.coupon ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, delivery, crane, coupon }));
    } catch {
      /* ignore */
    }
  }, [lines, delivery, crane, coupon]);

  const value = useMemo<CartState>(() => {
    const subtotal = lines.reduce((sum, line) => {
      const p = PRODUCTS.find((x) => x.id === line.productId);
      return sum + (p ? p.price * line.qty : 0);
    }, 0);
    const rate = COUPONS[coupon.trim().toUpperCase()] ?? 0;
    const discount = Math.round(subtotal * rate * 100) / 100;
    const deliveryCost = delivery ? DELIVERY_COST : 0;
    const craneCost = crane ? CRANE_COST : 0;
    const net = subtotal - discount + deliveryCost + craneCost;
    const vat = Math.round(net * 0.18 * 100) / 100;

    return {
      lines,
      add: (product, qty = 1) =>
        setLines((prev) => {
          const found = prev.find((l) => l.productId === product.id);
          if (found)
            return prev.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + qty } : l));
          return [...prev, { productId: product.id, qty }];
        }),
      setQty: (productId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.productId !== productId)
            : prev.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        ),
      remove: (productId) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
      clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      delivery,
      setDelivery,
      crane,
      setCrane,
      coupon,
      setCoupon,
      discount,
      deliveryCost,
      craneCost,
      vat,
      total: Math.round((net + vat) * 100) / 100,
      open,
      setOpen,
    };
  }, [lines, delivery, crane, coupon, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const shekel = (n: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2,
  }).format(n);
