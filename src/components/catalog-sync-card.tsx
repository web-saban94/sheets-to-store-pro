import { useState, useEffect, useTransition } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ExternalLink,
  Clock,
  Zap,
  PackageCheck,
} from "lucide-react";
import { fetchLiveCatalog } from "@/lib/sheets.functions";

export interface SyncedProduct {
  id?: string;
  sku?: string;
  name?: string;
  brand?: string;
  categoryId?: string;
  price?: number | string;
  unit?: string;
  imageUrl?: string;
  description?: string;
  promo?: string;
  inStock?: boolean;
}

interface SyncState {
  ok: boolean;
  products: SyncedProduct[];
  count: number;
  latencyMs: number;
  syncedAt: string | null;
  error?: string;
}

export function CatalogSyncCard() {
  const [syncState, setSyncState] = useState<SyncState>({
    ok: true,
    products: [],
    count: 0,
    latencyMs: 0,
    syncedAt: null,
  });
  const [isPending, startSync] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProductList, setShowProductList] = useState(false);

  // Re-fetch product catalog from Google Sheet
  const handleForceResync = () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startSync(async () => {
      const startTime = Date.now();
      try {
        // Try direct API route first
        let products: SyncedProduct[] = [];
        let ok = false;
        let latency = 0;
        let errMsg: string | undefined;

        try {
          const apiRes = await fetch(`/api/catalog?_t=${Date.now()}`, {
            headers: { "Cache-Control": "no-cache" },
          });
          if (apiRes.ok) {
            const data = (await apiRes.json()) as {
              ok?: boolean;
              products?: SyncedProduct[];
              count?: number;
              latencyMs?: number;
              error?: string;
            };
            ok = data.ok === true;
            products = Array.isArray(data.products) ? data.products : [];
            latency = data.latencyMs || Date.now() - startTime;
            errMsg = data.error;
          }
        } catch {
          // Fallback to ServerFn
        }

        // If direct API didn't succeed, use ServerFn
        if (!ok || products.length === 0) {
          const res = await fetchLiveCatalog();
          if (res && res.ok && Array.isArray(res.products)) {
            ok = true;
            products = res.products as SyncedProduct[];
            latency = Date.now() - startTime;
          } else {
            errMsg = "לא התקבלו נתוני מוצרים מהגיליון";
          }
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString("he-IL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        if (ok && products.length > 0) {
          setSyncState({
            ok: true,
            products,
            count: products.length,
            latencyMs: latency,
            syncedAt: timeStr,
          });
          setSuccessMessage(
            `סנכרון כפוי הושלם בהצלחה! נקלטו ${products.length} מוצרים ישירות מגיליון Google Sheets (${latency}ms).`,
          );
        } else {
          setSyncState((prev) => ({
            ...prev,
            ok: false,
            latencyMs: latency,
            error: errMsg,
          }));
          setErrorMessage(errMsg || "נכשל בסנכרון הקטלוג מ-Google Sheets");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "שגיאת רשת בלתי צפויה";
        setSyncState((prev) => ({
          ...prev,
          ok: false,
          error: message,
        }));
        setErrorMessage(message);
      }
    });
  };

  // Initial fetch on mount
  useEffect(() => {
    handleForceResync();
  }, []);

  return (
    <div
      id="catalog-sync-dashboard-card"
      className="overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-lg transition-all"
    >
      {/* Header with Title and 'Force Re-Sync' Button */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-platinum">
                סנכרון קטלוג מוצרים — Google Sheets
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isPending
                    ? "border border-amber-500/30 bg-amber-500/15 text-amber-400"
                    : syncState.ok && syncState.count > 0
                      ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                      : "border border-rose-500/30 bg-rose-500/15 text-rose-400"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isPending
                      ? "animate-pulse bg-amber-400"
                      : syncState.ok && syncState.count > 0
                        ? "bg-emerald-400"
                        : "bg-rose-400"
                  }`}
                />
                {isPending
                  ? "מסנכרן כעת מהגיליון..."
                  : syncState.ok && syncState.count > 0
                    ? `${syncState.count} מוצרים פעילים`
                    : "סנכרון ממתין"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              משיכה ישירה ומעודכנת של שורות המוצרים, מק״טים, מחירים ומבצעים מתוך Google Sheets.
            </p>
          </div>
        </div>

        {/* The 'Force Re-Sync' Button with Loading Spinner */}
        <div className="flex items-center gap-2">
          <button
            id="force-resync-btn"
            data-testid="force-resync-button"
            onClick={handleForceResync}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            title="בצע סנכרון כפוי של קטלוג המוצרים מ-Google Sheet"
          >
            <RefreshCw
              className={`size-4 ${isPending ? "animate-spin text-primary-foreground" : ""}`}
            />
            <span>{isPending ? "מסנכרן מהגיליון..." : "Force Re-Sync"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1: Total products */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PackageCheck className="size-3.5 text-emerald-400" />
            <span>מוצרים שנקלטו</span>
          </div>
          <div className="mt-1.5 text-sm font-extrabold text-platinum">
            {isPending ? (
              <span className="flex items-center gap-1 text-amber-400">
                <RefreshCw className="size-3 animate-spin" /> מרענן...
              </span>
            ) : (
              `${syncState.count} פריטים`
            )}
          </div>
        </div>

        {/* Metric 2: Latency */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="size-3.5 text-amber-400" />
            <span>זמן תגובה</span>
          </div>
          <div className="mt-1.5 text-sm font-extrabold text-platinum">
            {syncState.latencyMs > 0 ? `${syncState.latencyMs} ms` : "—"}
          </div>
        </div>

        {/* Metric 3: Sync Status */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-sky-400" />
            <span>סטטוס גיליון</span>
          </div>
          <div
            className={`mt-1.5 text-sm font-extrabold ${
              syncState.ok ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPending ? "טוען..." : syncState.ok ? "200 OK — מעודכן" : "שגיאת נתונים"}
          </div>
        </div>

        {/* Metric 4: Last Sync Timestamp */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>סונכרן לאחרונה</span>
          </div>
          <div className="mt-1.5 text-xs font-semibold text-platinum">
            {syncState.syncedAt || "טרם סונכרן"}
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mt-3.5 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-[10px] text-emerald-400/80 hover:text-emerald-300"
          >
            סגור
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="mt-3.5 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[10px] text-destructive/80 hover:text-destructive"
          >
            סגור
          </button>
        </div>
      )}

      {/* Toggle View of Synced Products Table */}
      {syncState.products.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowProductList((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-platinum hover:text-primary transition-colors"
            >
              <span>
                {showProductList ? "הסתר תצוגת מוצרים מסונכרנים" : "הצג מוצרים שסונכרנו מהגיליון"}
              </span>
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {syncState.products.length}
              </span>
            </button>

            <a
              href="/catalog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-platinum transition-colors"
            >
              <span>פתח קטלוג חי</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          {showProductList && (
            <div className="mt-3 max-h-60 overflow-x-auto rounded-xl border border-border bg-background/50 p-2">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-2 font-semibold">מק״ט</th>
                    <th className="p-2 font-semibold">שם מוצר</th>
                    <th className="p-2 font-semibold">מחיר</th>
                    <th className="p-2 font-semibold">יחידה</th>
                    <th className="p-2 font-semibold">מבצע</th>
                    <th className="p-2 font-semibold">מלאי</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {syncState.products.map((p, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="p-2 font-mono text-[11px] font-bold text-primary">
                        {p.sku || "—"}
                      </td>
                      <td className="p-2 font-medium text-platinum">{p.name || "—"}</td>
                      <td className="p-2 font-semibold text-platinum">
                        {Number(p.price) > 0 ? `₪${Number(p.price).toLocaleString()}` : "הצעת מחיר"}
                      </td>
                      <td className="p-2 text-muted-foreground">{p.unit || "יח׳"}</td>
                      <td className="p-2">
                        {p.promo ? (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                            {p.promo}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            p.inStock !== false
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {p.inStock !== false ? "זמין במלאי" : "אזל זמנית"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
