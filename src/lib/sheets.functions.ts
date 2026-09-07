import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Google Sheets (Apps Script) bridge.
 * Set the secret APPS_SCRIPT_URL to the /exec URL of the deployed Code.gs web app.
 * If it is not configured, calls succeed locally so the UI stays usable.
 */
async function postToSheets(action: string, payload: unknown): Promise<Record<string, unknown>> {
  const url =
    process.env["APPS_SCRIPT_URL"] ||
    "https://script.google.com/macros/s/AKfycbxFM8bIAuKEudnY9VUMvwVdKhZZJ6jGw73qOF20mSkjsZc2C38HWG3wrjVhsersbGwGGg/exec";
  if (!url) {
    return { ok: true, offline: true, message: "לא הוגדר חיבור לגיליון — הבקשה נשמרה מקומית." };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, payload, token: process.env["APPS_SCRIPT_TOKEN"] ?? "" }),
  });
  if (!res.ok) throw new Error(`Sheets error ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().optional().default(""),
    address: z.string().optional().default(""),
    notes: z.string().optional().default(""),
  }),
  items: z.array(
    z.object({ sku: z.string(), name: z.string(), qty: z.number(), price: z.number() }),
  ),
  delivery: z.boolean(),
  crane: z.boolean(),
  coupon: z.string().optional().default(""),
  total: z.number(),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => OrderSchema.parse(input))
  .handler(async ({ data }) => {
    const orderId = `SB-${Date.now().toString().slice(-8)}`;
    const result = await postToSheets("createOrder", {
      ...data,
      orderId,
      createdAt: new Date().toISOString(),
    });
    return { ...result, orderId, syncedToSheet: result.ok === true && !result.offline };
  });

const CustomerSchema = z.object({
  mode: z.enum(["login", "register"]),
  name: z.string().optional().default(""),
  phone: z.string().min(7),
  email: z.string().optional().default(""),
  company: z.string().optional().default(""),
});

export const customerAuth = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CustomerSchema.parse(input))
  .handler(async ({ data }) => {
    const result = await postToSheets(
      data.mode === "login" ? "loginCustomer" : "createCustomer",
      data,
    );
    return { ok: true, ...result };
  });

const ChatLogSchema = z.object({
  sessionId: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const logChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatLogSchema.parse(input))
  .handler(async ({ data }) => {
    await postToSheets("logChat", { ...data, createdAt: new Date().toISOString() });
    return { ok: true };
  });

export const fetchLiveCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const url =
    process.env["APPS_SCRIPT_URL"] ||
    "https://script.google.com/macros/s/AKfycbxFM8bIAuKEudnY9VUMvwVdKhZZJ6jGw73qOF20mSkjsZc2C38HWG3wrjVhsersbGwGGg/exec";
  if (!url) return { ok: false, products: [] };
  try {
    const res = await fetch(`${url}?action=catalog&_t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return { ok: false, products: [] };
    const data = (await res.json()) as { ok?: boolean; products?: Array<Record<string, unknown>> };
    return { ok: true, products: Array.isArray(data.products) ? data.products : [] };
  } catch {
    return { ok: false, products: [] };
  }
});

export const pingAppsScript = createServerFn({ method: "GET" }).handler(async () => {
  const url =
    process.env["APPS_SCRIPT_URL"] ||
    "https://script.google.com/macros/s/AKfycbxFM8bIAuKEudnY9VUMvwVdKhZZJ6jGw73qOF20mSkjsZc2C38HWG3wrjVhsersbGwGGg/exec";
  const start = Date.now();
  if (!url) {
    return {
      ok: false,
      latencyMs: 0,
      error: "כתובת APPS_SCRIPT_URL אינה מוגדרת",
      timestamp: new Date().toISOString(),
    };
  }
  try {
    let targetUrl = `${url}?action=ping&_t=${Date.now()}`;
    let res = await fetch(targetUrl, {
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SabanSite/1.0",
      },
    });

    let rawText = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      data = { rawText };
    }

    // אם גרסת ה-Apps Script הפרוסה עדיין לא עודכנה ל-action=ping, נבדוק קישוריות דרך action=orders
    if (data.ok === false && String(data.error || "").includes("Unknown action: ping")) {
      targetUrl = `${url}?action=orders&_t=${Date.now()}`;
      res = await fetch(targetUrl, {
        headers: {
          "Cache-Control": "no-cache",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SabanSite/1.0",
        },
      });
      rawText = await res.text();
      try {
        data = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        data = { rawText };
      }
    }

    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return {
        ok: false,
        latencyMs,
        error: `שגיאת שרת ${res.status}`,
        timestamp: new Date().toISOString(),
      };
    }

    const isOk =
      data.ok === true ||
      String(data.ok).toLowerCase() === "true" ||
      data.status === "פעיל ומחובר" ||
      Array.isArray(data.orders) ||
      Array.isArray(data.products) ||
      (typeof data.service === "string" && data.service.includes("סבן"));

    return {
      ok: isOk,
      latencyMs,
      service:
        typeof data.service === "string"
          ? data.service
          : "ח. סבן חומרי בניין (1994) בע״מ — Google Sheets",
      status: isOk ? "פעיל ומחובר" : "שגיאה בחיבור",
      version: typeof data.version === "string" ? data.version : "2.6",
      timestamp: typeof data.timestamp === "string" ? data.timestamp : new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "שגיאת תקשורת עם Apps Script",
      timestamp: new Date().toISOString(),
    };
  }
});

export const fetchLiveOrders = createServerFn({ method: "GET" }).handler(async () => {
  const url =
    process.env["APPS_SCRIPT_URL"] ||
    "https://script.google.com/macros/s/AKfycbxFM8bIAuKEudnY9VUMvwVdKhZZJ6jGw73qOF20mSkjsZc2C38HWG3wrjVhsersbGwGGg/exec";
  if (!url) return { ok: false, orders: [] };
  try {
    const res = await fetch(`${url}?action=orders&_t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return { ok: false, orders: [] };
    const data = (await res.json()) as { ok?: boolean; orders?: Array<Record<string, unknown>> };
    return { ok: true, orders: Array.isArray(data.orders) ? data.orders : [] };
  } catch {
    return { ok: false, orders: [] };
  }
});
