import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ping")({
  server: {
    handlers: {
      GET: async () => {
        const url =
          process.env["APPS_SCRIPT_URL"] ||
          "https://script.google.com/macros/s/AKfycbxFM8bIAuKEudnY9VUMvwVdKhZZJ6jGw73qOF20mSkjsZc2C38HWG3wrjVhsersbGwGGg/exec";
        const start = Date.now();

        if (!url) {
          return Response.json(
            {
              ok: false,
              latencyMs: 0,
              error: "כתובת APPS_SCRIPT_URL אינה מוגדרת",
              timestamp: new Date().toISOString(),
            },
            { status: 200 },
          );
        }

        try {
          // מנסים תחילה action=ping, ובמידה והגרסה הפרוסה ב-Apps Script עדיין מחזירה Unknown action: ping,
          // בודקים עם action=orders / action=catalog שנתמכים ופעילים בוודאות
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

          // אם הפריסה בשיטס מחזירה Unknown action עבור ping, נבצע בדיקת קישוריות מול action=orders
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
            return Response.json(
              {
                ok: false,
                latencyMs,
                error: `שגיאת שרת Apps Script (קוד ${res.status})`,
                timestamp: new Date().toISOString(),
              },
              { status: 200 },
            );
          }

          const isOk =
            data.ok === true ||
            String(data.ok).toLowerCase() === "true" ||
            data.status === "פעיל ומחובר" ||
            Array.isArray(data.orders) ||
            Array.isArray(data.products) ||
            (typeof data.service === "string" && data.service.includes("סבן"));

          return Response.json({
            ok: isOk,
            latencyMs,
            service:
              typeof data.service === "string"
                ? data.service
                : "ח. סבן חומרי בניין (1994) בע״מ — Google Sheets",
            status: isOk ? "פעיל ומחובר" : "שגיאה בחיבור",
            version: typeof data.version === "string" ? data.version : "2.6",
            timestamp:
              typeof data.timestamp === "string" ? data.timestamp : new Date().toISOString(),
          });
        } catch (err) {
          return Response.json(
            {
              ok: false,
              latencyMs: Date.now() - start,
              error: err instanceof Error ? err.message : "שגיאת תקשורת עם Apps Script",
              timestamp: new Date().toISOString(),
            },
            { status: 200 },
          );
        }
      },
    },
  },
});
