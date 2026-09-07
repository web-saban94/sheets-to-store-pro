import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { shekel, useCart } from "@/lib/cart";
import { PRODUCTS } from "@/lib/catalog";
import { submitOrder } from "@/lib/sheets.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "סיום הזמנה | ח. סבן חומרי בניין" },
      {
        name: "description",
        content: "השלמת הזמנה עם אפשרויות משלוח, מנוף וקוד קופון. ההזמנה נשלחת ישירות למערכת ההזמנות של החנות.",
      },
      { property: "og:title", content: "סיום הזמנה | ח. סבן חומרי בניין" },
      { property: "og:description", content: "עגלה חכמה עם משלוח, מנוף וקופונים." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const cart = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (cart.lines.length === 0) return;
    setStatus("sending");
    try {
      const items = cart.lines.map((l) => {
        const p = PRODUCTS.find((x) => x.id === l.productId)!;
        return { sku: p.sku, name: p.name, qty: l.qty, price: p.price };
      });
      const res = await submitOrder({
        data: {
          customer: form,
          items,
          delivery: cart.delivery,
          crane: cart.crane,
          coupon: cart.coupon,
          total: cart.total,
        },
      });
      setOrderId(res.orderId);
      setMessage(typeof res.message === "string" ? res.message : "");
      setStatus("done");
      cart.clear();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black text-platinum">ההזמנה התקבלה 🎉</h1>
        <p className="mt-3 text-muted-foreground">מספר הזמנה: <span className="font-bold text-platinum">{orderId}</span></p>
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
        <p className="mt-4 text-sm text-muted-foreground">נציג יחזור אליכם לאישור מלאי, מועד אספקה ותיאום מנוף.</p>
        <Link to="/catalog" className="mt-8 inline-block rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground">
          חזרה לקטלוג
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="text-3xl font-black text-platinum sm:text-4xl">סיום הזמנה</h1>

        <div className="frame mt-6 divide-y divide-border">
          {cart.lines.length === 0 && <p className="p-6 text-sm text-muted-foreground">העגלה ריקה.</p>}
          {cart.lines.map((l) => {
            const p = PRODUCTS.find((x) => x.id === l.productId);
            if (!p) return null;
            return (
              <div key={l.productId} className="flex items-center gap-4 p-4">
                <img src={p.image} alt={p.name} width={80} height={80} loading="lazy" className="size-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-platinum">{p.name}</p>
                  <p className="text-xs text-muted-foreground">מק״ט {p.sku} · {shekel(p.price)} / {p.unit}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) => cart.setQty(p.id, Number(e.target.value))}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <span className="w-24 text-end text-sm font-bold text-platinum">{shekel(p.price * l.qty)}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={placeOrder} className="frame mt-6 space-y-4 p-6">
          <h2 className="text-lg font-bold text-platinum">פרטי לקוח ואספקה</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם מלא *" value={form.name} onChange={set("name")} required />
            <Field label="טלפון *" value={form.phone} onChange={set("phone")} required />
            <Field label="אימייל" value={form.email} onChange={set("email")} type="email" />
            <Field label="כתובת אספקה" value={form.address} onChange={set("address")} />
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-platinum">הערות להזמנה</span>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="משלוח לאתר (₪180)" checked={cart.delivery} onChange={cart.setDelivery} />
            <Toggle label="פריקה במנוף (₪350)" checked={cart.crane} onChange={cart.setCrane} />
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-platinum">קוד קופון</span>
            <input
              value={cart.coupon}
              onChange={(e) => cart.setCoupon(e.target.value)}
              placeholder="לדוגמה: SABAN10"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>

          {status === "error" && (
            <p className="text-sm text-destructive">שליחת ההזמנה נכשלה. אפשר לנסות שוב או להתקשר לסניף.</p>
          )}

          <button
            type="submit"
            disabled={cart.lines.length === 0 || status === "sending"}
            className="w-full rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {status === "sending" ? "שולח הזמנה…" : `שליחת הזמנה · ${shekel(cart.total)}`}
          </button>
        </form>
      </div>

      <aside className="frame h-fit space-y-3 p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-platinum">סיכום</h2>
        <Row label="סה״כ מוצרים" value={shekel(cart.subtotal)} />
        {cart.discount > 0 && <Row label="הנחת קופון" value={`-${shekel(cart.discount)}`} />}
        {cart.deliveryCost > 0 && <Row label="משלוח" value={shekel(cart.deliveryCost)} />}
        {cart.craneCost > 0 && <Row label="מנוף" value={shekel(cart.craneCost)} />}
        <Row label="מע״מ 18%" value={shekel(cart.vat)} />
        <div className="flex justify-between border-t border-border pt-3 text-lg font-black text-platinum">
          <span>סה״כ לתשלום</span>
          <span>{shekel(cart.total)}</span>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-platinum">{value}</span>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-platinum">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
        checked ? "border-primary bg-primary/10 text-platinum" : "border-border text-muted-foreground"
      }`}
    >
      {label}
      <span className={`size-4 rounded-full border ${checked ? "border-primary bg-primary" : "border-border"}`} />
    </button>
  );
}
