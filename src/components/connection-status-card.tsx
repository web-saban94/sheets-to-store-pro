import { useState, useEffect, useTransition } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Clock,
  Zap,
} from "lucide-react";
import { pingAppsScript } from "@/lib/sheets.functions";

type PingResult = {
  ok: boolean;
  latencyMs: number;
  service?: string;
  status?: string;
  version?: string;
  timestamp?: string;
  error?: string;
};

export function ConnectionStatusCard() {
  const [result, setResult] = useState<PingResult | null>(null);
  const [isPending, startPing] = useTransition();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runPing = () => {
    startPing(async () => {
      try {
        const res = await pingAppsScript();
        setResult(res as PingResult);
        setLastChecked(new Date());
      } catch (e) {
        setResult({
          ok: false,
          latencyMs: 0,
          error: e instanceof Error ? e.message : "שגיאת רשת בלתי צפויה",
          timestamp: new Date().toISOString(),
        });
        setLastChecked(new Date());
      }
    });
  };

  useEffect(() => {
    runPing();
    // בדיקה תקופתית כל 60 שניות
    const timer = setInterval(runPing, 60000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = result?.ok === true;

  return (
    <div
      id="admin-connection-status"
      className="overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-lg transition-all"
    >
      {/* Header with Title and Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`grid size-10 place-items-center rounded-xl border ${
              isConnected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : result === null
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}
          >
            <Activity className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-platinum">
                סטטוס חיבור — Google Apps Script
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isConnected
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : result === null
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isConnected
                      ? "animate-pulse bg-emerald-400"
                      : result === null
                        ? "bg-amber-400"
                        : "bg-rose-400"
                  }`}
                />
                {result === null
                  ? "בודק קישוריות..."
                  : isConnected
                    ? "סנכרון תקין ומחובר"
                    : "סנכרון מנותק"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              מנטר קריאות בזמן אמת עבור קליטת הזמנות, קטלוג מוצרים וסנכרון CRM.
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={runPing}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-platinum transition hover:bg-secondary hover:text-white disabled:opacity-50"
          title="בצע בדיקת ping מיידית"
        >
          <RefreshCw className={`size-3.5 ${isPending ? "animate-spin text-primary" : ""}`} />
          {isPending ? "מבצע בדיקה..." : "בדוק חיבור כעת"}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1: Status */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isConnected ? (
              <CheckCircle2 className="size-3.5 text-emerald-400" />
            ) : (
              <XCircle className="size-3.5 text-rose-400" />
            )}
            <span>תוצאת הבדיקה</span>
          </div>
          <div
            className={`mt-1.5 text-sm font-extrabold ${
              isConnected ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {result === null ? "ממתין..." : isConnected ? "SUCCESS (200 OK)" : "FAILURE"}
          </div>
        </div>

        {/* Metric 2: Latency */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="size-3.5 text-amber-400" />
            <span>זמן תגובה (Latency)</span>
          </div>
          <div className="mt-1.5 text-sm font-extrabold text-platinum">
            {result ? `${result.latencyMs} ms` : "—"}
          </div>
        </div>

        {/* Metric 3: Version */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-sky-400" />
            <span>גרסת Apps Script</span>
          </div>
          <div className="mt-1.5 text-sm font-extrabold text-platinum">
            {result?.version ? `v${result.version}` : "v2.6"}
          </div>
        </div>

        {/* Metric 4: Last checked */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>בדיקה אחרונה</span>
          </div>
          <div className="mt-1.5 text-xs font-semibold text-platinum">
            {lastChecked
              ? lastChecked.toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "טרם נבדק"}
          </div>
        </div>
      </div>

      {/* Info / Error Message Bar */}
      {result && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-secondary/30 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-500"}`}
            />
            {isConnected ? (
              <span className="text-zinc-300">
                {result.service || "ח. סבן חומרי בניין (1994) בע״מ"} — {result.status || "תקין"}
              </span>
            ) : (
              <span className="text-rose-300">שגיאה: {result.error || "חיבור נכשל"}</span>
            )}
          </div>

          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-platinum"
          >
            פתח פרויקט Apps Script
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}
