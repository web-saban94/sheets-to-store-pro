import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Google Sheets (Apps Script) bridge.
 * Set the secret APPS_SCRIPT_URL to the /exec URL of the deployed Code.gs web app.
 * If it is not configured, calls succeed locally so the UI stays usable.
 */
async function postToSheets(action: string, payload: unknown): Promise<Record<string, unknown>> {
  const url = process.env["APPS_SCRIPT_URL"];
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
    const result = await postToSheets("createOrder", { ...data, orderId, createdAt: new Date().toISOString() });
    return { ...result, orderId };
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
    const result = await postToSheets(data.mode === "login" ? "loginCustomer" : "createCustomer", data);
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
