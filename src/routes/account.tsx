import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { customerAuth } from "@/lib/sheets.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "אזור אישי ללקוחות | ח. סבן חומרי בניין" },
      {
        name: "description",
        content: "כניסה לאזור הלקוחות או פתיחת כרטיס לקוח חדש — מעקב הזמנות, הצעות מחיר ותנאי אשראי.",
      },
      { property: "og:title", content: "אזור אישי ללקוחות | ח. סבן חומרי בניין" },
      { property: "og:description", content: "ניהול כרטיס לקוח, הזמנות ותנאים מיוחדים לקבלנים." },
    ],
  }),
  component: Account,
});

function Account() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [reply, setReply] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-black text-platinum">אזור אישי</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        כניסה לכרטיס לקוח קיים או פתיחת כרטיס חדש עם תנאים לקבלנים.
      </p>

      <div className="mt-6 flex gap-2 rounded-xl border border-border p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "login" ? "כניסה" : "פתיחת כרטיס לקוח"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="frame mt-6 space-y-4 p-6">
        {mode === "register" && (
          <>
            <Input label="שם מלא *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label="שם חברה / ח.פ" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          </>
        )}
        <Input label="טלפון *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Input label="אימייל" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />

        {state === "ok" && <p className="text-sm text-primary">{reply}</p>}
        {state === "error" && <p className="text-sm text-destructive">אירעה תקלה. אפשר לנסות שוב.</p>}

        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {state === "sending" ? "שולח…" : mode === "login" ? "כניסה" : "יצירת כרטיס"}
        </button>
      </form>
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
