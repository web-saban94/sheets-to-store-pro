import { createFileRoute } from "@tanstack/react-router";

const BACKUP_CATALOG_URL =
  "https://script.google.com/macros/s/AKfycbxFM8bIAuKEudnY9VUMvwVdKhZZJ6jGw73qOF20mSkjsZc2C38HWG3wrjVhsersbGwGGg/exec";

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const start = Date.now();
        const primaryUrl = process.env["APPS_SCRIPT_URL"] || BACKUP_CATALOG_URL;

        const fetchFromUrl = async (url: string) => {
          const targetUrl = `${url}?action=catalog&_t=${Date.now()}`;
          const res = await fetch(targetUrl, {
            redirect: "follow",
            headers: {
              "Cache-Control": "no-cache",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SabanSite/1.0",
            },
          });
          if (!res.ok) return null;
          const rawText = await res.text();
          try {
            return JSON.parse(rawText) as {
              ok?: boolean;
              products?: Array<Record<string, unknown>>;
            };
          } catch {
            return null;
          }
        };

        try {
          let data = await fetchFromUrl(primaryUrl);
          let products = Array.isArray(data?.products) ? data.products : [];

          // If primary sheet had no products and backup is different, try backup
          if (products.length === 0 && primaryUrl !== BACKUP_CATALOG_URL) {
            const backupData = await fetchFromUrl(BACKUP_CATALOG_URL);
            if (Array.isArray(backupData?.products) && backupData.products.length > 0) {
              products = backupData.products;
              data = backupData;
            }
          }

          const latencyMs = Date.now() - start;

          return Response.json({
            ok: true,
            products,
            count: products.length,
            latencyMs,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          return Response.json(
            {
              ok: false,
              products: [],
              count: 0,
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
