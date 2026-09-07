import { getAccessToken } from "./google-auth";

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetMetadata {
  properties: {
    sheetId: number;
    title: string;
    index: number;
  };
}

export interface SpreadsheetDetails {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: SheetMetadata[];
  spreadsheetUrl: string;
}

/**
 * משיכת רשימת גיליונות אלקטרוניים של המשתמש מ-Google Drive
 */
export async function listUserSpreadsheets(): Promise<DriveSpreadsheetFile[]> {
  const token = await getAccessToken();
  if (!token) throw new Error("נדרש חיבור לחשבון Google לצורך גישה לגיליונות");

  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
  );
  const fields = encodeURIComponent("files(id,name,modifiedTime,webViewLink)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=25&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`שגיאה בטעינת גיליונות מ-Google Drive: ${err}`);
  }

  const data = (await res.json()) as { files?: DriveSpreadsheetFile[] };
  return data.files || [];
}

/**
 * קבלת פרטי גיליון (מטא-דאטה ורשימת טאבים)
 */
export async function getSpreadsheetDetails(spreadsheetId: string): Promise<SpreadsheetDetails> {
  const token = await getAccessToken();
  if (!token) throw new Error("נדרש חיבור לחשבון Google");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`שגיאה בקריאת פרטי הגיליון: ${err}`);
  }

  return (await res.json()) as SpreadsheetDetails;
}

/**
 * קריאת טווחי ערכים מתוך גיליון (למשל 'הזמנות!A1:H20')
 */
export async function getSpreadsheetValues(
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) throw new Error("נדרש חיבור לחשבון Google");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`שגיאה בקריאת נתוני הגיליון (${range}): ${err}`);
  }

  const data = (await res.json()) as { values?: string[][] };
  return data.values || [];
}

/**
 * יצירת גיליון Google Sheets ייעודי חדש עבור ח. סבן
 */
export async function createSabanSpreadsheet(): Promise<{
  id: string;
  url: string;
  title: string;
}> {
  const token = await getAccessToken();
  if (!token) throw new Error("נדרש חיבור לחשבון Google");

  const title = `ח. סבן חומרי בניין (1994) בע״מ — מעקב הזמנות (${new Date().toLocaleDateString("he-IL")})`;

  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: "הזמנות לקוחות",
            gridProperties: { rowCount: 200, columnCount: 10 },
          },
        },
        {
          properties: {
            title: "קטלוג מוצרים",
            gridProperties: { rowCount: 100, columnCount: 6 },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`שגיאה ביצירת גיליון Google Sheets חדש: ${err}`);
  }

  const created = (await res.json()) as { spreadsheetId: string; spreadsheetUrl: string };

  // הזנת כותרות ברירת-מחדל לטאב 'הזמנות לקוחות'
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/'הזמנות לקוחות'!A1:J1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: "'הזמנות לקוחות'!A1:J1",
        majorDimension: "ROWS",
        values: [
          [
            "מזהה הזמנה",
            "תאריך ושעה",
            "שם לקוח",
            "טלפון",
            "כתובת פריקה",
            "משלוח",
            "מנוף",
            "הערות",
            "סה״כ לתשלום (₪)",
            "סטטוס",
          ],
        ],
      }),
    },
  );

  return {
    id: created.spreadsheetId,
    url: created.spreadsheetUrl,
    title,
  };
}

/**
 * הוספת שורת הזמנה לגיליון קיים (Append)
 */
export async function appendOrderRow(
  spreadsheetId: string,
  sheetTab: string,
  orderData: {
    orderId: string;
    customerName: string;
    phone: string;
    address: string;
    delivery: string;
    crane: string;
    notes: string;
    total: number | string;
    status: string;
  },
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error("נדרש חיבור לחשבון Google");

  const row = [
    orderData.orderId,
    new Date().toLocaleString("he-IL"),
    orderData.customerName,
    orderData.phone,
    orderData.address,
    orderData.delivery,
    orderData.crane,
    orderData.notes,
    String(orderData.total),
    orderData.status,
  ];

  const range = `'${sheetTab}'!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values: [row],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`שגיאה בסנכרון ההזמנה ל-Google Sheets: ${err}`);
  }

  return true;
}
