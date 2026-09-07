import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useTransition } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { customerAuth, fetchLiveOrders } from "@/lib/sheets.functions";
import { ConnectionStatusCard } from "@/components/connection-status-card";
import { GoogleSheetsPanel } from "@/components/google-sheets-panel";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "אזור אישי ודשבורד ניהול | ח. סבן חומרי בניין" },
      {
        name: "description",
        content: "כניסה לאזור הלקוחות, ניהול הזמנות ובקרת סנכרון מערכת לגוגל שיטס.",
      },
      { property: "og:title", content: "אזור אישי ודשבורד ניהול | ח. סבן חומרי בניין" },
      { property: "og:description", content: "דשבורד ניהול, בקרת חיבור Apps Script וכרטיס לקוח." },
    ],
  }),
  component: Account,
});

function Account() {
  const [mode, setMode] = useState<"login" | "register" | "admin">("admin");
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [reply, setReply] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "admin") return;
    setState("sending");
    try {
      const res = await customerAuth({ data: { mode, ...form } });
      const msg = (res as Record<string, unknown>)["message"];
      setReply(
        typeof msg === "string"
          ? msg
          : mode === "login"
            ? "אימות נשלח למערכת. נציג יאשר את הכניסה בהקדם."
            : "כרטיס הלקוח נוצר ונשמר במערכת ה-CRM שלנו.",
      );
      setState("ok");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-platinum">
            {mode === "admin" ? "דשבורד מנהלים ובקרה" : "אזור אישי ללקוחות"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "admin"
              ? "ניטור חי של סנכרון Google Sheets, הזמנות ומצב שרת ה-Apps Script."
              : "כניסה לכרטיס לקוח קיים או פתיחת כרטיס חדש עם תנאים מיוחדים לקבלנים."}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1.5 rounded-xl border border-border bg-surface p-1 self-start sm:self-auto">
          <button
            onClick={() => setMode("admin")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              mode === "admin"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-muted-foreground hover:text-platinum"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            דשבורד מנהלים
          </button>
          <button
            onClick={() => setMode("login")}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              mode === "login"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-platinum"
            }`}
          >
            כניסת לקוח
          </button>
          <button
            onClick={() => setMode("register")}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              mode === "register"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-platinum"
            }`}
          >
            פתיחת כרטיס
          </button>
        </div>
      </div>

      {mode === "admin" ? (
        <AdminDashboard />
      ) : (
        <div className="mx-auto mt-8 max-w-lg">
          <form onSubmit={submit} className="frame space-y-4 p-6">
            <h2 className="text-lg font-bold text-platinum">
              {mode === "login" ? "כניסה לאזור הלקוחות" : "פתיחת כרטיס לקוח חדש"}
            </h2>
            {mode === "register" && (
              <>
                <Input
                  label="שם מלא *"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Input
                  label="שם חברה / ח.פ"
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                />
              </>
            )}
            <Input
              label="טלפון *"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              required
            />
            <Input
              label="אימייל"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              type="email"
            />

            {state === "ok" && <p className="text-sm text-primary">{reply}</p>}
            {state === "error" && (
              <p className="text-sm text-destructive">אירעה תקלה. אפשר לנסות שוב.</p>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {state === "sending" ? "שולח…" : mode === "login" ? "כניסה" : "יצירת כרטיס"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [isRefreshing, startRefresh] = useTransition();

  const loadOrders = () => {
    startRefresh(async () => {
      try {
        const res = await fetchLiveOrders();
        if (res.ok && Array.isArray(res.orders)) {
          setOrders(res.orders);
        }
      } catch {
        // Handled silently
      }
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="mt-8 space-y-6">
      {/* Real-time Connection Status Card */}
      <ConnectionStatusCard />

      {/* Google Sheets & Drive OAuth Integration Panel */}
      <GoogleSheetsPanel />

      {/* Orders summary synced from Sheet */}
      <div className="frame p-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-platinum">
              הזמנות אחרונות שנקלטו בגיליון ({orders.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              מסונכרן ישירות עם טאב ״הזמנות״ בקובץ Google Sheets.
            </p>
          </div>
          <button
            onClick={loadOrders}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-platinum hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            {isRefreshing ? "טוען..." : "רענן הזמנות"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          {orders.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {isRefreshing
                ? "טוען הזמנות מגיליון Google Sheets..."
                : "טרם נרשמו הזמנות או שאין נתונים."}
            </p>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-semibold">מספר הזמנה</th>
                  <th className="pb-2 font-semibold">לקוח</th>
                  <th className="pb-2 font-semibold">טלפון</th>
                  <th className="pb-2 font-semibold">משלוח</th>
                  <th className="pb-2 font-semibold">מנוף</th>
                  <th className="pb-2 font-semibold">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {orders
                  .slice(-5)
                  .reverse()
                  .map((o, idx) => (
                    <tr key={idx} className="hover:bg-secondary/30">
                      <td className="py-2.5 font-mono font-bold text-platinum">
                        {String(o["orderId"] || `SB-${idx}`)}
                      </td>
                      <td className="py-2.5 text-platinum">{String(o["customerName"] || "—")}</td>
                      <td className="py-2.5 text-muted-foreground font-mono">
                        {String(o["phone"] || "—")}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            String(o["delivery"]) === "כן"
                              ? "bg-sky-500/20 text-sky-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {String(o["delivery"] || "לא")}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            String(o["crane"]) === "כן"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {String(o["crane"] || "לא")}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {String(o["status"] || "חדשה")}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-platinum">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
