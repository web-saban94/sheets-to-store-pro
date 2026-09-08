import { useState, useEffect, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  Table,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Send,
} from "lucide-react";
import { initAuth, googleSignIn, logoutGoogle, getAccessToken } from "@/lib/google-auth";
import {
  listUserSpreadsheets,
  getSpreadsheetDetails,
  getSpreadsheetValues,
  createSabanSpreadsheet,
  appendOrderRow,
  type DriveSpreadsheetFile,
  type SpreadsheetDetails,
} from "@/lib/google-sheets";

export function GoogleSheetsPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets state
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [sheetDetails, setSheetDetails] = useState<SpreadsheetDetails | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [tabValues, setTabValues] = useState<string[][]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Confirmation modals (MANDATORY for mutating Workspace API operations)
  const [confirmCreateModal, setConfirmCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [confirmAppendModal, setConfirmAppendModal] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [orderToAppend, setOrderToAppend] = useState({
    orderId: `SB-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: "ישראל ישראלי (קבלן שלד)",
    phone: "050-1234567",
    address: "רחוב הבנים 14, הוד השרון",
    delivery: "כן",
    crane: "כן",
    notes: "פריקה בחצר אחורית, בתיאום טלפוני חצי שעה מראש",
    total: 3450,
    status: "בטיפול",
  });

  const loadTabValues = useCallback(async (id: string, tabName: string) => {
    setIsLoadingValues(true);
    try {
      const values = await getSpreadsheetValues(id, `'${tabName}'!A1:Z30`);
      setTabValues(values);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "שגיאה בטעינת שורות הגיליון");
    } finally {
      setIsLoadingValues(false);
    }
  }, []);

  const selectSpreadsheet = useCallback(
    async (id: string) => {
      setSelectedSheetId(id);
      setIsLoadingValues(true);
      setActionError(null);
      try {
        const details = await getSpreadsheetDetails(id);
        setSheetDetails(details);
        const firstTabName = details.sheets[0]?.properties.title || "Sheet1";
        setSelectedTab(firstTabName);
        await loadTabValues(id, firstTabName);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "שגיאה בקריאת פרטי הגיליון");
      } finally {
        setIsLoadingValues(false);
      }
    },
    [loadTabValues],
  );

  const loadSpreadsheets = useCallback(async () => {
    setIsLoadingList(true);
    setActionError(null);
    try {
      const files = await listUserSpreadsheets();
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSheetId) {
        const first = files[0];
        if (first?.id) {
          selectSpreadsheet(first.id);
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "נכשל בטעינת גיליונות מ-Google Drive");
    } finally {
      setIsLoadingList(false);
    }
  }, [selectSpreadsheet, selectedSheetId]);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(!!token);
        setIsLoadingAuth(false);
        if (token) {
          loadSpreadsheets();
        }
      },
      () => {
        setUser(null);
        setHasToken(false);
        setIsLoadingAuth(false);
      },
    );
    return () => unsubscribe();
  }, [loadSpreadsheets]);

  async function handleGoogleLogin() {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        await loadSpreadsheets();
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "אירעה שגיאה בהתחברות באמצעות חשבון Google",
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    await logoutGoogle();
    setUser(null);
    setHasToken(false);
    setSpreadsheets([]);
    setSelectedSheetId(null);
    setSheetDetails(null);
    setTabValues([]);
  }

  // Execute creation after explicit confirmation dialog
  async function confirmCreateNewSheet() {
    setIsCreating(true);
    setActionError(null);
    try {
      const newSheet = await createSabanSpreadsheet();
      setConfirmCreateModal(false);
      setSuccessMsg(`הגיליון "${newSheet.title}" נוצר בהצלחה בחשבון ה-Google Drive שלך!`);
      await loadSpreadsheets();
      await selectSpreadsheet(newSheet.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "אירעה שגיאה ביצירת הגיליון החדש");
    } finally {
      setIsCreating(false);
    }
  }

  // Execute append order after explicit confirmation dialog
  async function confirmAppendOrder() {
    if (!selectedSheetId) return;
    setIsAppending(true);
    setActionError(null);
    try {
      const tabToUse =
        sheetDetails?.sheets.find((s) => s.properties.title.includes("הזמנ"))?.properties.title ||
        selectedTab ||
        "Sheet1";

      await appendOrderRow(selectedSheetId, tabToUse, orderToAppend);
      setConfirmAppendModal(false);
      setSuccessMsg(`ההזמנה ${orderToAppend.orderId} נוספה בהצלחה לגיליון בלשונית "${tabToUse}"!`);
      await loadTabValues(selectedSheetId, tabToUse);
      // Generate next mock order id
      setOrderToAppend((prev) => ({
        ...prev,
        orderId: `SB-${Math.floor(10000 + Math.random() * 90000)}`,
      }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "אירעה שגיאה בסנכרון ההזמנה לגיליון");
    } finally {
      setIsAppending(false);
    }
  }

  return (
    <div className="frame p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-platinum flex items-center gap-2">
              סנכרון ישיר עם Google Sheets & Drive
              {user && hasToken && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="size-2.5" />
                  מחובר לחשבון
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              חיבור רשמי ב-OAuth לחשבון Google לקריאה, כתיבה ויצירת גיליונות אלקטרוניים עבור ח. סבן.
            </p>
          </div>
        </div>

        {/* Google User Status or Login button */}
        <div>
          {isLoadingAuth ? (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="size-3 animate-spin text-primary" />
              בודק אימות...
            </div>
          ) : user && hasToken ? (
            <div className="flex items-center gap-3">
              <div className="text-left text-xs">
                <p className="font-semibold text-platinum">{user.displayName || "משתמש מחובר"}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                title="התנתק מחשבון Google"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">התנתק</span>
              </button>
            </div>
          ) : (
            /* Official Google Sign-In button standard representation */
            <button
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-60"
            >
              {/* Google Brand Icon */}
              <svg className="size-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isSigningIn ? "מתחבר לגוגל..." : "התחבר עם חשבון Google"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {authError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}
      {actionError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-[10px] text-emerald-400/80 hover:text-emerald-300"
          >
            סגור
          </button>
        </div>
      )}

      {/* Not logged in State */}
      {(!user || !hasToken) && !isLoadingAuth && (
        <div className="rounded-xl border border-border/80 bg-background/50 p-6 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <FileSpreadsheet className="size-6" />
          </div>
          <h4 className="text-sm font-bold text-platinum">חיבור מאובטח ל-Google Sheets</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            התחבר עם חשבון ה-Google שלך כדי לאפשר לאפליקציה לצפות בגיליונות ההזמנות, ליצור גיליון
            מעקב חדש ב-Drive ולסנכרן נתוני עסקאות בזמן אמת, באישור מפורש בלבד.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              התחבר עם Google עכשיו
            </button>
          </div>
        </div>
      )}

      {/* Logged in workspace controls */}
      {user && hasToken && (
        <div className="space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-platinum">בחר גיליון מ-Drive:</label>
              <select
                value={selectedSheetId || ""}
                onChange={(e) => {
                  if (e.target.value) selectSpreadsheet(e.target.value);
                }}
                disabled={isLoadingList || spreadsheets.length === 0}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-platinum outline-none focus:border-primary max-w-[260px] truncate"
              >
                {spreadsheets.length === 0 ? (
                  <option value="">לא נמצאו גיליונות ב-Drive</option>
                ) : (
                  spreadsheets.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))
                )}
              </select>

              <button
                onClick={loadSpreadsheets}
                disabled={isLoadingList}
                className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:text-platinum disabled:opacity-50"
                title="רענן רשימת קבצים מ-Drive"
              >
                <RefreshCw
                  className={`size-3.5 ${isLoadingList ? "animate-spin text-primary" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Button requiring Confirmation: Create dedicated sheet */}
              <button
                onClick={() => setConfirmCreateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="size-3.5" />
                צור גיליון ייעודי לח. סבן
              </button>

              {/* Button requiring Confirmation: Append order */}
              {selectedSheetId && (
                <button
                  onClick={() => setConfirmAppendModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Send className="size-3.5" />
                  סנכרן הזמנה לגיליון
                </button>
              )}
            </div>
          </div>

          {/* Active Spreadsheet Details & Tabs */}
          {sheetDetails && (
            <div className="rounded-xl border border-border bg-background/40 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 truncate">
                  <Table className="size-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-xs text-platinum truncate">
                    {sheetDetails.properties.title}
                  </span>
                  <a
                    href={sheetDetails.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    title="פתח ב-Google Sheets"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                {/* Tabs selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[11px] text-muted-foreground">לשונית:</span>
                  {sheetDetails.sheets.map((sheet) => {
                    const title = sheet.properties.title;
                    const isActive = title === selectedTab;
                    return (
                      <button
                        key={sheet.properties.sheetId}
                        onClick={() => {
                          setSelectedTab(title);
                          if (selectedSheetId) loadTabValues(selectedSheetId, title);
                        }}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-surface border border-border text-muted-foreground hover:text-platinum"
                        }`}
                      >
                        {title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Table Viewer */}
              <div className="overflow-x-auto max-h-72">
                {isLoadingValues ? (
                  <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="size-3.5 animate-spin text-primary" />
                    טוען נתונים מהגיליון...
                  </div>
                ) : tabValues.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    הגיליון ריק או שאין נתונים בטווח הנבחר.
                  </p>
                ) : (
                  <table className="w-full text-right text-[11px]">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground bg-surface/50">
                        {tabValues[0]?.map((col, idx) => (
                          <th key={idx} className="p-2 font-semibold whitespace-nowrap">
                            {col || `עמודה ${idx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {tabValues.slice(1, 15).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-secondary/20">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 text-platinum/90 whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL: Create New Spreadsheet */}
      {confirmCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30">
                <AlertTriangle className="size-5" />
              </div>
              <h4 className="text-base font-bold text-platinum">
                אישור יצירת קובץ Google Sheets חדש
              </h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              האם ברצונך ליצור קובץ Google Sheets חדש ב-Google Drive שלך בשם:
              <br />
              <strong className="text-platinum mt-1 block">
                ח. סבן חומרי בניין (1994) בע״מ — מעקב הזמנות
              </strong>
              הקובץ יכלול מבנה טבלאות מסודר עם לשוניות ״הזמנות לקוחות״ ו״קטלוג מוצרים״.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setConfirmCreateModal(false)}
                disabled={isCreating}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-platinum hover:bg-secondary transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={confirmCreateNewSheet}
                disabled={isCreating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    יוצר קובץ...
                  </>
                ) : (
                  "אשר יצירת גיליון"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL: Append Order to Spreadsheet */}
      {confirmAppendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <Send className="size-5" />
              </div>
              <h4 className="text-base font-bold text-platinum">
                אישור הוספת הזמנה ל-Google Sheets
              </h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              פעולה זו תוסיף שורה חדשה לקובץ{" "}
              <strong className="text-platinum">{sheetDetails?.properties.title}</strong> בגיליון
              שלך.
            </p>

            <div className="rounded-xl border border-border bg-background p-3 space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">מזהה הזמנה:</span>
                <span className="font-mono font-bold text-platinum">{orderToAppend.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">לקוח:</span>
                <span className="text-platinum">{orderToAppend.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">כתובת ומשלוח:</span>
                <span className="text-platinum">
                  {orderToAppend.address} (מנוף: {orderToAppend.crane})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">סה״כ לתשלום:</span>
                <span className="font-bold text-emerald-400">
                  ₪{orderToAppend.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setConfirmAppendModal(false)}
                disabled={isAppending}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-platinum hover:bg-secondary transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={confirmAppendOrder}
                disabled={isAppending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-60"
              >
                {isAppending ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    מוסיף שורה לגיליון...
                  </>
                ) : (
                  "אשר סנכרון לגיליון"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
