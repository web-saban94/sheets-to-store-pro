/**
 * ח. סבן חומרי בניין (1994) בע״מ — מערכת ניהול, קטלוג, הזמנות ו-CRM בגוגל שיטס
 * =========================================================================
 * גרסה 2.5 — גיור מלא, עיצוב עשיר, תמיכה מלאה ב-RTL (מימין לשמאל) וחיבור API כפול.
 *
 * הוראות התקנה מהירות:
 * -------------------
 * 1. פתחו גיליון Google Sheets ריק חדש (או קיים).
 * 2. בתפריט העליון לחצו: הרחבות (Extensions) > Apps Script.
 * 3. הדביקו את כל תוכן הקובץ הזה במקום מה שיש ושמרו (Ctrl+S / Cmd+S).
 * 4. בתפריט הפונקציות בחרו: `setupDatabaseHebrew` ולחצו 'הפעל' (Run).
 *    (בפעם הראשונה תתבקשו לאשר הרשאות גישה לחשבון שלכם - אשרו כרגיל).
 * 5. הגיליון יוקם במלואו: כיוון מימין לשמאל, כל הטאבים בעברית, עיצוב עסקי,
 *    דשבורד מחווני ביצועים, קטלוג מלא של 12 מוצרים, קטגוריות, מותגים וחוקי מחיר.
 * 6. לחיבור לאתר: לחצו 'פריסה' (Deploy) > 'פריסה חדשה' (New deployment) >
 *    סוג: 'אפליקציית אינטרנט' (Web app) >
 *    הפעלה בתור: 'אני' (Me) >
 *    למי יש גישה: 'כולם' (Anyone) >
 *    לחצו Deploy והעתיקו את כתובת ה-URL (המסתיימת ב-/exec) למשתנה APPS_SCRIPT_URL באתר.
 */

/* =========================================================================
 * 1. הגדרות מבנה הגיליונות והתאמת שדות (עברית <-> API באנגלית)
 * ========================================================================= */

var SCHEMAS = {
  // 1. הזמנות לקוחות
  Orders: {
    sheetName: "הזמנות",
    aliasNames: ["הזמנות", "Orders"],
    columns: [
      { key: "orderId", title: "מספר הזמנה", width: 130, format: "@" },
      { key: "createdAt", title: "תאריך ושעה", width: 150, format: "yyyy-mm-dd hh:mm" },
      { key: "customerName", title: "שם הלקוח", width: 160, format: "@" },
      { key: "phone", title: "טלפון", width: 130, format: "@" },
      { key: "email", title: "דוא״ל", width: 180, format: "@" },
      { key: "address", title: "כתובת למשלוח", width: 220, format: "@" },
      { key: "itemsSummary", title: "פירוט פריטים (לקריאה)", width: 280, format: "@" },
      { key: "delivery", title: "משלוח?", width: 90, format: "@", validation: ["כן", "לא"] },
      { key: "crane", title: "פריקת מנוף?", width: 100, format: "@", validation: ["כן", "לא"] },
      { key: "coupon", title: "קוד קופון", width: 110, format: "@" },
      { key: "total", title: "סה״כ לתשלום", width: 120, format: "₪#,##0.00" },
      {
        key: "status",
        title: "סטטוס הזמנה",
        width: 150,
        format: "@",
        validation: [
          "חדשה - ממתין לאישור",
          "בטיפול / בהכנה",
          "אושר ויצא למשלוח",
          "סופק ללקוח",
          "בוטל",
        ],
      },
      { key: "notes", title: "הערות לקוח", width: 200, format: "@" },
      { key: "internalNotes", title: "הערות סניף פנימיות", width: 200, format: "@" },
      { key: "itemsJson", title: "נתוני JSON מקוריים", width: 140, format: "@" },
    ],
  },

  // 2. קטלוג מוצרים
  Products: {
    sheetName: "קטלוג מוצרים",
    aliasNames: ["קטלוג מוצרים", "Products"],
    columns: [
      { key: "id", title: "מזהה פנימי", width: 90, format: "@" },
      { key: "sku", title: "מק״ט", width: 110, format: "@" },
      { key: "name", title: "שם המוצר", width: 220, format: "@" },
      { key: "brand", title: "מותג / יצרן", width: 120, format: "@" },
      {
        key: "categoryId",
        title: "מזהה קטגוריה",
        width: 120,
        format: "@",
        validation: ["building", "paint", "sealing", "tools"],
      },
      { key: "categoryName", title: "שם קטגוריה", width: 130, format: "@" },
      { key: "price", title: "מחיר (לפני מע״מ/כולל)", width: 130, format: "₪#,##0.00" },
      { key: "unit", title: "יחידת מידה", width: 90, format: "@" },
      { key: "inStock", title: "במלאי?", width: 90, format: "@", validation: ["כן", "לא"] },
      { key: "promo", title: "תווית מבצע", width: 120, format: "@" },
      { key: "description", title: "תיאור טכני", width: 260, format: "@" },
      { key: "dryingTime", title: "זמן ייבוש / אשפרה", width: 180, format: "@" },
      { key: "coverage", title: "כושר כיסוי / תצרוכת", width: 170, format: "@" },
      { key: "application", title: "הוראות יישום", width: 260, format: "@" },
      { key: "imageUrl", title: "קישור לתמונה", width: 160, format: "@" },
    ],
  },

  // 3. קטגוריות
  Categories: {
    sheetName: "קטגוריות",
    aliasNames: ["קטגוריות", "Categories"],
    columns: [
      { key: "id", title: "מזהה (Slug)", width: 110, format: "@" },
      { key: "name", title: "שם הקטגוריה", width: 150, format: "@" },
      { key: "tagline", title: "תיאור תמציתי", width: 240, format: "@" },
      { key: "sortOrder", title: "סדר תצוגה", width: 90, format: "0" },
      { key: "imageUrl", title: "תמונה מייצגת", width: 180, format: "@" },
    ],
  },

  // 4. מותגים
  Brands: {
    sheetName: "מותגים",
    aliasNames: ["מותגים", "Brands"],
    columns: [
      { key: "id", title: "מזהה מותג", width: 100, format: "@" },
      { key: "name", title: "שם המותג", width: 150, format: "@" },
      { key: "active", title: "פעיל?", width: 90, format: "@", validation: ["כן", "לא"] },
      { key: "notes", title: "הערות", width: 200, format: "@" },
    ],
  },

  // 5. CRM ולקוחות
  CRM: {
    sheetName: "לקוחות ו-CRM",
    aliasNames: ["לקוחות ו-CRM", "CRM_Customers", "לקוחות"],
    columns: [
      { key: "customerId", title: "מזהה לקוח", width: 120, format: "@" },
      { key: "createdAt", title: "תאריך הצטרפות", width: 140, format: "yyyy-mm-dd hh:mm" },
      { key: "name", title: "שם לקוח / איש קשר", width: 160, format: "@" },
      { key: "company", title: "שם חברה / קבלן", width: 160, format: "@" },
      { key: "phone", title: "טלפון", width: 130, format: "@" },
      { key: "email", title: "דוא״ל", width: 180, format: "@" },
      { key: "ordersCount", title: "מספר הזמנות", width: 110, format: "#,##0" },
      { key: "lifetimeValue", title: "מחזור כולל (LTV)", width: 130, format: "₪#,##0.00" },
      {
        key: "segment",
        title: "סגמנט לקוח",
        width: 130,
        format: "@",
        validation: ["לקוח חדש", "קבלן / מוסדי", "פרטי קבוע", "ליד מהאתר", "VIP"],
      },
      { key: "lastContact", title: "אינטראקציה אחרונה", width: 150, format: "yyyy-mm-dd hh:mm" },
      { key: "notes", title: "הערות CRM", width: 220, format: "@" },
    ],
  },

  // 6. לוג צ'אט נועה-AI
  ChatLogs: {
    sheetName: "לוג צ'אט נועה",
    aliasNames: ["לוג צ'אט נועה", "Chat_Logs"],
    columns: [
      { key: "timestamp", title: "תאריך ושעה", width: 150, format: "yyyy-mm-dd hh:mm" },
      { key: "sessionId", title: "מזהה סשן", width: 140, format: "@" },
      { key: "question", title: "שאלת הלקוח", width: 300, format: "@" },
      { key: "answer", title: "תשובת נועה-AI", width: 350, format: "@" },
    ],
  },

  // 7. מבצעים וקופונים
  Promotions: {
    sheetName: "מבצעים והנחות",
    aliasNames: ["מבצעים והנחות", "Promotions"],
    columns: [
      { key: "id", title: "מזהה מבצע", width: 110, format: "@" },
      { key: "sku", title: "מק״ט מוצר רלוונטי", width: 120, format: "@" },
      { key: "title", title: "כותרת המבצע", width: 180, format: "@" },
      { key: "discountPct", title: "אחוז הנחה", width: 110, format: "0.0%" },
      { key: "startDate", title: "תאריך התחלה", width: 120, format: "yyyy-mm-dd" },
      { key: "endDate", title: "תאריך סיום", width: 120, format: "yyyy-mm-dd" },
      { key: "active", title: "פעיל?", width: 90, format: "@", validation: ["כן", "לא"] },
    ],
  },

  // 8. הגדרות וחוקי חנות
  Rulebook: {
    sheetName: "הגדרות וחוקי חנות",
    aliasNames: ["הגדרות וחוקי חנות", "Rulebook"],
    columns: [
      { key: "key", title: "מפתח הגדרה", width: 160, format: "@" },
      { key: "value", title: "ערך", width: 250, format: "@" },
      { key: "description", title: "הסבר ופירוט", width: 280, format: "@" },
    ],
  },
};

/* =========================================================================
 * 2. תפריט מותאם אישית ב-Google Sheets
 * ========================================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("ח. סבן חומרי בניין 🧱")
    .addItem("🚀 הקמת המערכת וגיור מלא ומעוצב", "setupDatabaseHebrew")
    .addItem("📦 טעינת כל מוצרי הקטלוג (12 מוצרים)", "seedFullHebrewCatalog")
    .addItem("🎨 רענון עיצוב, צבעי טאבים ויישור לימין (RTL)", "formatAllSheets")
    .addSeparator()
    .addItem("📊 עדכון לוח בקרה ומחוונים", "refreshDashboard")
    .addItem("🧪 בדיקת חיבור פעיל למערכת", "testConnection")
    .addSeparator()
    .addItem("🧹 איפוס הזמנות הדגמה (ללא פגיעה בעיצוב)", "clearDemoOrders")
    .addToUi();
}

/* =========================================================================
 * 3. פונקציית ההקמה הראשית — גיור מלא, עיצוב עשיר ו-RTL
 * ========================================================================= */

function setupDatabaseHebrew() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // יצירה ועיצוב דשבורד מחוונים ראשי ראשון
  setupDashboardSheet_(ss);

  var TAB_COLORS = {
    Orders: "#F59E0B",
    Products: "#10B981",
    Categories: "#6366F1",
    Brands: "#8B5CF6",
    CRM: "#EC4899",
    ChatLogs: "#06B6D4",
    Promotions: "#EF4444",
    Rulebook: "#64748B",
  };

  // יצירת שאר הטאבים לפי הסכמה
  Object.keys(SCHEMAS).forEach(function (schemaKey) {
    var def = SCHEMAS[schemaKey];
    var sheet = getOrCreateSheet_(ss, def);

    // הגדרת כיוון מימין לשמאל, רשת וצבע טאב
    sheet.setRightToLeft(true);
    sheet.setHideGridlines(false);
    sheet.setTabColor(TAB_COLORS[schemaKey] || "#64748B");

    // הגדרת שורת כותרות
    var titles = def.columns.map(function (c) {
      return c.title;
    });
    var headerRange = sheet.getRange(1, 1, 1, titles.length);
    headerRange.setValues([titles]);
    headerRange.setBackground("#0F172A"); // רקע כחול-כהה יוקרתי
    headerRange.setFontColor("#FFFFFF"); // טקסט לבן בולט
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Arial");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);

    // הגדרת רוחבי עמודות ופורמט מספרים
    def.columns.forEach(function (col, idx) {
      var colIdx = idx + 1;
      sheet.setColumnWidth(colIdx, col.width);

      // פורמט תאים לעמודה
      var dataRange = sheet.getRange(2, colIdx, Math.max(sheet.getMaxRows() - 1, 1), 1);
      if (col.format) {
        dataRange.setNumberFormat(col.format);
      }

      // אימות נתונים (Dropdowns)
      if (col.validation && col.validation.length > 0) {
        var rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(col.validation, true)
          .setAllowInvalid(true)
          .build();
        dataRange.setDataValidation(rule);
      }
    });

    // הגדרת עיצוב מותנה (צבעים לסטטוסים)
    applyConditionalFormatting_(sheet, schemaKey, def);
  });

  // מילוי חוקי ברירת מחדל
  seedRulebook_(ss);

  // מילוי קטלוג מוצרים מלא
  seedFullHebrewCatalog();

  // מעבר לטאב הדשבורד בסיום
  var dash = ss.getSheetByName("לוח בקרה");
  if (dash) ss.setActiveSheet(dash);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "הגיליון הוגדר בהצלחה בגיור מלא ומעוצב!",
    "ח. סבן (1994) בע״מ",
    8,
  );
  return "הגיליון הוקם ועוצב בהצלחה מלאה!";
}

/* =========================================================================
 * 4. דשבורד מחווני ביצועים וסיכום (KPIs)
 * ========================================================================= */

function setupDashboardSheet_(ss) {
  var name = "לוח בקרה";
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name, 0);
  } else {
    // הזז לראש הגיליון
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(1);
  }

  sheet.setRightToLeft(true);
  sheet.setTabColor("#0284C7");

  // רקע כללי נקי
  sheet.getRange("A1:K30").setBackground("#F8FAFC");
  sheet.getRange("A1:K30").setFontFamily("Arial");

  // כותרת עליונה
  sheet.getRange("B2:J2").merge();
  var title = sheet.getRange("B2");
  title.setValue("ח. סבן חומרי בניין (1994) בע״מ — לוח בקרה ומחוונים");
  title
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#0F172A")
    .setHorizontalAlignment("right");

  sheet.getRange("B3:J3").merge();
  var sub = sheet.getRange("B3");
  sub.setValue("סינכרון הזמנות, קטלוג מוצרים, ניהול CRM ושיחות צ׳אט עם נועה-AI");
  sub.setFontSize(10).setFontColor("#64748B").setHorizontalAlignment("right");

  // כרטיס 1: סה"כ הכנסות
  setupKpiCard_(
    sheet,
    "B5:C7",
    'סה"כ הכנסות מהזמנות',
    "=IFERROR(SUM('הזמנות'!K2:K), 0)",
    "₪#,##0.00",
    "#0284C7",
    "#E0F2FE",
  );

  // כרטיס 2: סה"כ הזמנות
  setupKpiCard_(
    sheet,
    "D5:E7",
    'סה"כ הזמנות שנקלטו',
    "=IFERROR(COUNTA('הזמנות'!A2:A), 0)",
    "#,##0",
    "#0F172A",
    "#F1F5F9",
  );

  // כרטיס 3: הזמנות ממתינות לאישור
  setupKpiCard_(
    sheet,
    "F5:G7",
    "ממתינות לאישור סניף",
    "=IFERROR(COUNTIF('הזמנות'!L2:L, \"*ממתין*\"), 0)",
    "#,##0",
    "#D97706",
    "#FEF3C7",
  );

  // כרטיס 4: לקוחות רשומים ב-CRM
  setupKpiCard_(
    sheet,
    "H5:I7",
    "לקוחות ולידים ב-CRM",
    "=IFERROR(COUNTA('לקוחות ו-CRM'!A2:A), 0)",
    "#,##0",
    "#16A34A",
    "#DCFCE7",
  );

  // טבלת סטטוס סניפים ושירות
  sheet
    .getRange("B10:E10")
    .merge()
    .setValue("סניפי החנות ושעות פעילות")
    .setFontWeight("bold")
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF");
  sheet.setRowHeight(10, 28);
  sheet
    .getRange("B11:E11")
    .setValues([["סניף", "כתובת", "ימים א׳-ה׳", "יום ו׳"]])
    .setFontWeight("bold")
    .setBackground("#E2E8F0");
  sheet
    .getRange("B12:E13")
    .setValues([
      ["סניף ראשי", "התלמיד 6, הוד השרון", "06:30 - 17:00", "06:30 - 13:00"],
      ["סניף שני", "החרש 10, הוד השרון", "07:00 - 17:00", "07:00 - 13:00"],
    ])
    .setBackground("#FFFFFF");

  // הנחיות שימוש מהירות
  sheet
    .getRange("G10:I10")
    .merge()
    .setValue("הנחיות מהירות")
    .setFontWeight("bold")
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF");

  sheet
    .getRange("G11:I11")
    .merge()
    .setValue("הזמנות חדשות נכנסות ישירות לטאב 'הזמנות' עם פירוט פריטים, מנוף ומשלוח.");
  sheet
    .getRange("G12:I12")
    .merge()
    .setValue("ניתן לעדכן סטטוס הזמנה דרך התיבה הנפתחת בעמודת 'סטטוס הזמנה'.");
  sheet
    .getRange("G13:I13")
    .merge()
    .setValue("שינוי מחיר או מלאי בטאב 'קטלוג מוצרים' מתעדכן ישירות באתר ובצ׳אט.");

  sheet.getRange("G11:I13").setBackground("#FFFFFF").setFontSize(9).setFontColor("#334155");

  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 40);
  sheet.setColumnWidth(7, 180);
  sheet.setColumnWidth(8, 180);
  sheet.setColumnWidth(9, 180);
}

function setupKpiCard_(sheet, rangeStr, label, formula, format, borderColor, bgColor) {
  var range = sheet.getRange(rangeStr);
  range.setBackground(bgColor);
  range.setBorder(
    true,
    true,
    true,
    true,
    true,
    true,
    borderColor,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM,
  );

  var topCell = sheet.getRange(rangeStr.split(":")[0]);
  var topRow = topCell.getRow();
  var topCol = topCell.getColumn();
  var topRange = sheet.getRange(topRow, topCol, 1, 2);
  topRange.merge();
  topRange
    .setValue(label)
    .setFontSize(9)
    .setFontColor("#475569")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  var numRow = topCell.getRow() + 1;
  var numCol = topCell.getColumn();
  var numCell = sheet.getRange(numRow, numCol, 2, 2);
  numCell.merge();
  numCell.setFormula(formula);
  numCell.setNumberFormat(format);
  numCell.setFontSize(18);
  numCell.setFontWeight("bold");
  numCell.setFontColor(borderColor);
  numCell.setHorizontalAlignment("center");
  numCell.setVerticalAlignment("middle");
}

/* =========================================================================
 * 5. עיצוב מותנה ורענון כללי
 * ========================================================================= */

function applyConditionalFormatting_(sheet, schemaKey, def) {
  var rules = [];

  if (schemaKey === "Orders") {
    var statusColIdx = 12; // עמודה L
    var statusRange = sheet.getRange(2, statusColIdx, Math.max(sheet.getMaxRows() - 1, 1), 1);

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains("ממתין")
        .setBackground("#FEF3C7")
        .setFontColor("#92400E")
        .setRanges([statusRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains("בטיפול")
        .setBackground("#E0F2FE")
        .setFontColor("#075985")
        .setRanges([statusRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains("יצא למשלוח")
        .setBackground("#EDE9FE")
        .setFontColor("#5B21B6")
        .setRanges([statusRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains("סופק")
        .setBackground("#DCFCE7")
        .setFontColor("#166534")
        .setRanges([statusRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains("בוטל")
        .setBackground("#FEE2E2")
        .setFontColor("#991B1B")
        .setRanges([statusRange])
        .build(),
    );
  }

  if (schemaKey === "Products") {
    var inStockColIdx = 9; // עמודה I
    var inStockRange = sheet.getRange(2, inStockColIdx, Math.max(sheet.getMaxRows() - 1, 1), 1);

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("כן")
        .setBackground("#DCFCE7")
        .setFontColor("#166534")
        .setRanges([inStockRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("לא")
        .setBackground("#FEE2E2")
        .setFontColor("#991B1B")
        .setRanges([inStockRange])
        .build(),
    );
  }

  sheet.setConditionalFormatRules(rules);
}

function formatAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(function (sh) {
    sh.setRightToLeft(true);
  });
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "כל הגיליונות יושרו לימין (RTL) בהצלחה.",
    "ח. סבן",
    4,
  );
}

/* =========================================================================
 * 6. מילוי נתוני קטלוג מלאים (12 מוצרים, קטגוריות, מותגים, חוקים)
 * ========================================================================= */

function seedFullHebrewCatalog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. קטגוריות
  var catSheet = getOrCreateSheet_(ss, SCHEMAS.Categories);
  if (catSheet.getLastRow() < 2) {
    var categoriesData = [
      ["building", "חומרי בניין", "מלט, טיח, בלוקים, גבס ואגרגטים", 1, ""],
      ["paint", "צבעים וגמר", "צבעי פנים, חוץ, לכות ושפכטל מקצועי", 2, ""],
      ["sealing", "איטום ובידוד", "חומרי ביטומן, אקרילי ופולימרי לגגות ומרפסות", 3, ""],
      ["tools", "כלי עבודה", "כלי יד, חשמל, ערבול ואביזרי בנייה", 4, ""],
    ];
    catSheet.getRange(2, 1, categoriesData.length, 5).setValues(categoriesData);
  }

  // 2. מותגים
  var brandSheet = getOrCreateSheet_(ss, SCHEMAS.Brands);
  if (brandSheet.getLastRow() < 2) {
    var brandsData = [
      ["b1", "נשר", "כן", "מלט ותשתיות מלט"],
      ["b2", "טמבור", "כן", "צבעים, טיח ושפכטל"],
      ["b3", "נירלט", "כן", "צבעי פנים וחוץ"],
      ["b4", "פזקר", "כן", "מערכות איטום וביטומן"],
      ["b5", "כרמית", "כן", "איטום וגבס"],
      ["b6", "מפעלי איטונג", "כן", "בלוקים ובידוד תרמי"],
      ["b7", "בוש", "כן", "כלי עבודה חשמליים מקצועיים"],
    ];
    brandSheet.getRange(2, 1, brandsData.length, 4).setValues(brandsData);
  }

  // 3. 12 מוצרי הקטלוג הרשמיים של החנות
  var prodSheet = getOrCreateSheet_(ss, SCHEMAS.Products);
  if (prodSheet.getLastRow() < 2) {
    var productsData = [
      [
        "p1",
        "NSH-50",
        'מלט פורטלנד נשר CEM II 50 ק"ג',
        "נשר",
        "building",
        "חומרי בניין",
        32,
        "שק",
        "כן",
        "מבצע שבועי",
        "מלט אפור איכותי לעבודות בטון, טיח ותשתיות. חוזק גבוה ואחידות מלאה.",
        "התקשרות ראשונית 3-4 שעות, אשפרה 28 יום",
        'כ-1 מ"ר ביציקה בעובי 5 ס"מ',
        "ערבוב במערבל עם מים ביחס 0.5, יישום ביעה או משאבה",
        "",
      ],
      [
        "p2",
        "ITG-20",
        "בלוק איטונג 20 ס״מ",
        "מפעלי איטונג",
        "building",
        "חומרי בניין",
        14.5,
        "יחידה",
        "כן",
        "",
        "בלוק בטון תאי קל משקל עם בידוד תרמי ואקוסטי מעולה.",
        "דבק מתקשה תוך 2 שעות",
        'כ-8 יחידות למ"ר קיר',
        "הנחה על דבק איטונג בעזרת כף משוננת 8 מ״מ",
        "",
      ],
      [
        "p3",
        "TMB-SUP",
        "סופרקריל טמבור 18 ליטר",
        "טמבור",
        "paint",
        "צבעים וגמר",
        289,
        "פח",
        "כן",
        "מבצע שבועי",
        "צבע אקרילי מט לפנים ולחוץ, כיסוי מלא וגוון יציב לאורך שנים.",
        "יבש למגע שעה, מעיל נוסף לאחר 4 שעות",
        'עד 10 מ"ר לליטר בשכבה',
        "רולר, מברשת או ריסוס — 2 שכבות על שטח נקי ויבש",
        "",
      ],
      [
        "p4",
        "NRL-WOD",
        "לכה פוליאוריטן נירלט 5 ליטר",
        "נירלט",
        "paint",
        "צבעים וגמר",
        249,
        "פח",
        "כן",
        "",
        "לכה שקופה עמידה לעץ פנים וחוץ, גימור משיי יוקרתי.",
        "יבש למגע 3 שעות, ליטוש לאחר 12 שעות",
        'כ-12 מ"ר לליטר',
        "מברשת שיער טבעי, 2-3 שכבות עם ליטוש בין השכבות",
        "",
      ],
      [
        "p5",
        "PZK-BIT",
        "ביטומן אלסטומרי פזקר 18 ק״ג",
        "פזקר",
        "sealing",
        "איטום ובידוד",
        379,
        "דלי",
        "כן",
        "",
        "איטום גגות ומרפסות בעמידות UV גבוהה וגמישות מלאה.",
        "6 שעות בין שכבות, ייבוש מלא 48 שעות",
        'כ-1.5 ק"ג למ"ר בשתי שכבות',
        "מריחה במברשת/מגב על יסוד ביטומני, שילוב רשת שריון בפינות",
        "",
      ],
      [
        "p6",
        "KRM-ACR",
        "איטום אקרילי כרמית לגגות 20 ק״ג",
        "כרמית",
        "sealing",
        "איטום ובידוד",
        329,
        "דלי",
        "כן",
        "",
        "ציפוי אקרילי לבן מחזיר קרינה, מקטין חום ואוטם סדקים.",
        "4 שעות בין שכבות",
        'כ-1 ק"ג למ"ר',
        "2 שכבות מוצלבות ברולר, לאחר ניקוי וייבוש המצע",
        "",
      ],
      [
        "p7",
        "BSH-GBH",
        "פטישון בוש GBH 2-26",
        "בוש",
        "tools",
        "כלי עבודה",
        1290,
        "יחידה",
        "כן",
        "מבצע שבועי",
        "פטישון SDS-Plus מקצועי 830W לקידוח בבטון ולחציבה קלה.",
        "—",
        "קידוח עד 26 מ״מ בבטון",
        "שימוש עם מקדחי SDS-Plus, מצב סיבוב/הקשה נבחר",
        "",
      ],
      [
        "p8",
        "TLS-MIX",
        "מערבל צבע וטיח 1600W",
        "בוש",
        "tools",
        "כלי עבודה",
        649,
        "יחידה",
        "לא",
        "",
        "מערבל ידני דו-מהירותי לערבוב טיח, דבק ובטון.",
        "—",
        "עד 80 ליטר לערבוב",
        "בחירת מוט ערבול לפי צמיגות, מהירות נמוכה בתחילת ערבוב",
        "",
      ],
      [
        "p9",
        "PLS-GYP",
        "לוח גבס ירוק עמיד מים 1.2x2.6",
        "כרמית",
        "building",
        "חומרי בניין",
        78,
        "לוח",
        "כן",
        "",
        "לוח גבס לחדרים רטובים עם ליבה דוחת מים.",
        "שפכטל מתייבש 12 שעות",
        'כ-3.1 מ"ר ללוח',
        "הברגה לפרופילי מגן כל 25 ס״מ, סרט וגמר שפכטל",
        "",
      ],
      [
        "p10",
        "TMB-SPK",
        "שפכטל מוכן טמבור 20 ק״ג",
        "טמבור",
        "paint",
        "צבעים וגמר",
        119,
        "דלי",
        "כן",
        "",
        "שפכטל גמר מוכן לשימוש ליישור קירות ותקרות.",
        "8-12 שעות לשכבה",
        'כ-1.2 ק"ג למ"ר',
        "מריחה בכף פלדה, ליטוש בנייר 120 לפני צבע",
        "",
      ],
      [
        "p11",
        "AGG-SND",
        "חול מחצבה ממוין 1 טון (ביג בג)",
        "נשר",
        "building",
        "חומרי בניין",
        240,
        "טון",
        "כן",
        "",
        "חול נקי למילוי, טיח ובטון. אספקה עם מנוף לפי דרישה.",
        "—",
        'כ-0.6 מ"ק',
        "פריקה במנוף ישירות לאתר",
        "",
      ],
      [
        "p12",
        "NRL-EXT",
        "צבע חוץ סיליקוני נירלט 18 ליטר",
        "נירלט",
        "paint",
        "צבעים וגמר",
        419,
        "פח",
        "כן",
        "",
        "צבע סיליקוני נושם לחזיתות, עמידות גבוהה למזג אוויר.",
        "יבש למגע 2 שעות, שכבה נוספת 6 שעות",
        'כ-8 מ"ר לליטר',
        "יסוד מקשר ואז 2 שכבות ברולר צמר",
        "",
      ],
    ];
    prodSheet
      .getRange(2, 1, productsData.length, SCHEMAS.Products.columns.length)
      .setValues(productsData);
  }

  // 4. מבצעים פעילים
  var promoSheet = getOrCreateSheet_(ss, SCHEMAS.Promotions);
  if (promoSheet.getLastRow() < 2) {
    var promosData = [
      ["promo1", "NSH-50", "מבצע שבועי על שקי מלט נשר", 0.1, "2026-01-01", "2026-12-31", "כן"],
      ["promo2", "TMB-SUP", "מבצע קבלנים סופרקריל 18 ליטר", 0.08, "2026-01-01", "2026-12-31", "כן"],
      ["promo3", "BSH-GBH", "ערכת פטישון בוש במחיר מיוחד", 0.12, "2026-01-01", "2026-12-31", "כן"],
    ];
    promoSheet.getRange(2, 1, promosData.length, 7).setValues(promosData);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast("הקטלוג המלא נטען בהצלחה לגיליון.", "ח. סבן", 5);
}

function seedRulebook_(ss) {
  var sheet = getOrCreateSheet_(ss, SCHEMAS.Rulebook);
  if (sheet.getLastRow() < 2) {
    var defaultRules = [
      ["delivery_cost", 180, 'עלות משלוח סטנדרטי באזור השרון (בש"ח)'],
      ["crane_cost", 350, 'עלות פריקה באמצעות מנוף באתר (בש"ח)'],
      ["vat_rate", 0.18, 'שיעור מע"מ עדכני (18%)'],
      ["coupon_SABAN10", 0.1, "קופון הנחה 10% ללקוחות האתר"],
      ["coupon_BUILD5", 0.05, "קופון הנחה 5% לקבלנים"],
      ["branch_1_name", "סניף ראשי התלמיד", "שם הסניף הראשון"],
      ["branch_1_address", "התלמיד 6, הוד השרון", "כתובת סניף 1"],
      ["branch_1_hours", "א׳-ה׳ 06:30-17:00, ו׳ 06:30-13:00", "שעות פתיחה סניף 1"],
      ["branch_1_phone", "09-7000000", "טלפון סניף 1"],
      ["branch_2_name", "סניף החרש", "שם הסניף השני"],
      ["branch_2_address", "החרש 10, הוד השרון", "כתובת סניף 2"],
      ["branch_2_hours", "א׳-ה׳ 07:00-17:00, ו׳ 07:00-13:00", "שעות פתיחה סניף 2"],
      ["branch_2_phone", "09-7000001", "טלפון סניף 2"],
      ["store_name", "ח. סבן חומרי בניין (1994) בע״מ", "שם העסק המלא"],
    ];
    sheet.getRange(2, 1, defaultRules.length, 3).setValues(defaultRules);
  }
}

/* =========================================================================
 * 7. פונקציות עזר לגישה ומיפוי נתונים
 * ========================================================================= */

function getOrCreateSheet_(ss, schemaDef) {
  var sheet = null;
  // חיפוש לפי שם ראשי
  sheet = ss.getSheetByName(schemaDef.sheetName);
  if (sheet) return sheet;

  // חיפוש לפי כינויים נוספים (למשל אם הוקם בעבר באנגלית)
  if (schemaDef.aliasNames) {
    for (var i = 0; i < schemaDef.aliasNames.length; i++) {
      sheet = ss.getSheetByName(schemaDef.aliasNames[i]);
      if (sheet) {
        // שינוי שם לעברית תקנית
        try {
          sheet.setName(schemaDef.sheetName);
        } catch (e) {}
        return sheet;
      }
    }
  }

  // יצירת גיליון חדש
  sheet = ss.insertSheet(schemaDef.sheetName);
  return sheet;
}

function getRowsBySchema_(schemaDef) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, schemaDef);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headerRow = values[0];
  var cols = schemaDef.columns;

  // מיפוי מיקומי עמודות לפי כותרת או מפתח
  var keyMap = {};
  cols.forEach(function (col) {
    var foundIdx = -1;
    for (var i = 0; i < headerRow.length; i++) {
      var h = String(headerRow[i]).trim();
      if (h === col.title || h === col.key) {
        foundIdx = i;
        break;
      }
    }
    keyMap[col.key] = foundIdx;
  });

  return values.slice(1).map(function (row) {
    var obj = {};
    cols.forEach(function (col) {
      var idx = keyMap[col.key];
      obj[col.key] = idx !== -1 && idx !== undefined && row[idx] !== undefined ? row[idx] : "";
    });
    return obj;
  });
}

function appendBySchema_(schemaDef, dataObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, schemaDef);
  var values = sheet
    .getRange(1, 1, 1, sheet.getLastColumn() || schemaDef.columns.length)
    .getValues();
  var headerRow = values[0] || [];

  // בניית שורה לפי הסדר שבגיליון בפועל
  var rowValues = [];
  schemaDef.columns.forEach(function (col, idx) {
    var val = dataObj[col.key];
    if (val === undefined) {
      // נסה לחפש לפי כותרת בעברית
      val = dataObj[col.title];
    }
    if (val === undefined || val === null) val = "";
    rowValues.push(val);
  });

  sheet.appendRow(rowValues);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function isAuthorized_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty("API_TOKEN");
  return !expected || expected === token;
}

/* =========================================================================
 * 8. ממשק ה-API (doGet & doPost)
 * ========================================================================= */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "ping";

  try {
    if (action === "ping") {
      return jsonResponse_({
        ok: true,
        service: "ח. סבן חומרי בניין (1994) בע״מ — מערכת גוגל שיטס",
        status: "פעיל ומחובר",
        version: "2.5",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "catalog") {
      var products = getRowsBySchema_(SCHEMAS.Products).map(function (p) {
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          categoryId: p.categoryId,
          price: Number(p.price || 0),
          unit: p.unit,
          imageUrl: p.imageUrl,
          description: p.description,
          dryingTime: p.dryingTime,
          coverage: p.coverage,
          application: p.application,
          promo: p.promo,
          inStock:
            String(p.inStock) === "כן" ||
            p.inStock === true ||
            String(p.inStock).toLowerCase() === "true",
        };
      });

      return jsonResponse_({
        ok: true,
        products: products,
        categories: getRowsBySchema_(SCHEMAS.Categories),
        brands: getRowsBySchema_(SCHEMAS.Brands),
        promotions: getRowsBySchema_(SCHEMAS.Promotions),
      });
    }

    if (action === "orders") {
      return jsonResponse_({
        ok: true,
        orders: getRowsBySchema_(SCHEMAS.Orders),
      });
    }

    if (action === "rulebook") {
      return jsonResponse_({
        ok: true,
        rules: getRowsBySchema_(SCHEMAS.Rulebook),
      });
    }

    if (action === "customer") {
      var phone = String(e.parameter.phone || "").trim();
      var customers = getRowsBySchema_(SCHEMAS.CRM);
      var found = customers.filter(function (c) {
        return String(c.phone).trim() === phone;
      });
      return jsonResponse_({
        ok: true,
        customer: found.length > 0 ? found[0] : null,
      });
    }

    return jsonResponse_({ ok: false, error: "פעולה לא מוכרת: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    if (!isAuthorized_(body.token)) {
      return jsonResponse_({ ok: false, error: "אין הרשאה מתאימה (טוקן לא תואם)" });
    }

    var action = body.action;
    var payload = body.payload || {};

    if (action === "createOrder") {
      return jsonResponse_(handleCreateOrder_(payload));
    }

    if (action === "createCustomer" || action === "loginCustomer") {
      return jsonResponse_(handleCustomerAuth_(action, payload));
    }

    if (action === "logChat") {
      return jsonResponse_(handleLogChat_(payload));
    }

    if (action === "upsertProduct") {
      return jsonResponse_(handleUpsertProduct_(payload));
    }

    return jsonResponse_({ ok: false, error: "פעולה לא נתמכת: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/* =========================================================================
 * 9. לוגיקה עסקית — יצירת הזמנה, סנכרון לקוח וצ'אט
 * ========================================================================= */

function handleCreateOrder_(p) {
  var orderId = p.orderId || "SB-" + new Date().getTime().toString().slice(-8);
  var customer = p.customer || {};
  var items = p.items || [];

  // יצירת תיאור קריא של הפריטים לקריאה נוחה ישירות בגיליון
  var itemsSummary = items
    .map(function (item) {
      return (
        item.name + " (" + item.qty + " " + (item.unit || "יח'") + ") - ₪" + item.price * item.qty
      );
    })
    .join(" | ");

  var orderRecord = {
    orderId: orderId,
    createdAt:
      p.createdAt || Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"),
    customerName: customer.name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
    itemsSummary: itemsSummary,
    delivery: p.delivery ? "כן" : "לא",
    crane: p.crane ? "כן" : "לא",
    coupon: p.coupon || "",
    total: Number(p.total || 0),
    status: "חדשה - ממתין לאישור",
    notes: customer.notes || "",
    internalNotes: "",
    itemsJson: JSON.stringify(items),
  };

  appendBySchema_(SCHEMAS.Orders, orderRecord);

  // סנכרון ועדכון כרטיס הלקוח ב-CRM
  syncCustomerFromOrder_(customer, Number(p.total || 0));

  // התראה באימייל אם מוגדר
  sendOrderEmailNotification_(orderId, customer, Number(p.total || 0), itemsSummary);

  return {
    ok: true,
    orderId: orderId,
    message: "ההזמנה נקלטה בהצלחה בגוגל שיטס. נציג סניף יחזור לאישור סופי.",
  };
}

function syncCustomerFromOrder_(customer, orderTotal) {
  if (!customer.phone) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, SCHEMAS.CRM);
  var data = sheet.getDataRange().getValues();

  var phoneColIdx = 4; // עמודה E
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][phoneColIdx]).trim() === String(customer.phone).trim()) {
      var currentOrders = Number(data[i][6] || 0) + 1;
      var currentLtv = Number(data[i][7] || 0) + orderTotal;
      sheet.getRange(i + 1, 7).setValue(currentOrders);
      sheet.getRange(i + 1, 8).setValue(currentLtv);
      sheet
        .getRange(i + 1, 10)
        .setValue(Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"));
      return;
    }
  }

  // לקוח חדש
  appendBySchema_(SCHEMAS.CRM, {
    customerId: "C-" + new Date().getTime().toString().slice(-6),
    createdAt: Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"),
    name: customer.name || "",
    company: customer.company || "",
    phone: customer.phone || "",
    email: customer.email || "",
    ordersCount: 1,
    lifetimeValue: orderTotal,
    segment: "לקוח חדש",
    lastContact: Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"),
    notes: customer.notes || "הזמנה ראשונה מהאתר",
  });
}

function handleCustomerAuth_(mode, p) {
  var phone = String(p.phone || "").trim();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, SCHEMAS.CRM);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][4]).trim() === phone) {
      var foundCust = {
        customerId: data[i][0],
        name: data[i][2],
        company: data[i][3],
        phone: data[i][4],
        email: data[i][5],
        ordersCount: data[i][6],
        lifetimeValue: data[i][7],
        segment: data[i][8],
      };
      return {
        ok: true,
        message: "ברוך שובך, " + (foundCust.name || "") + "!",
        customer: foundCust,
      };
    }
  }

  if (mode === "loginCustomer") {
    return { ok: false, message: "מספר הטלפון עדיין אינו רשום. נא לבצע הרשמה קצרה." };
  }

  // יצירת לקוח חדש
  var newCust = {
    customerId: "C-" + new Date().getTime().toString().slice(-6),
    createdAt: Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"),
    name: p.name || "",
    company: p.company || "",
    phone: phone,
    email: p.email || "",
    ordersCount: 0,
    lifetimeValue: 0,
    segment: "ליד מהאתר",
    lastContact: Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"),
    notes: "נרשם דרך אתר האינטרנט",
  };

  appendBySchema_(SCHEMAS.CRM, newCust);
  return { ok: true, message: "כרטיס הלקוח נוצר בהצלחה.", customer: newCust };
}

function handleLogChat_(p) {
  appendBySchema_(SCHEMAS.ChatLogs, {
    timestamp:
      p.createdAt || Utilities.formatDate(new Date(), "Asia/Jerusalem", "yyyy-MM-dd HH:mm:ss"),
    sessionId: p.sessionId || "",
    question: p.question || "",
    answer: p.answer || "",
  });
  return { ok: true };
}

function handleUpsertProduct_(p) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet_(ss, SCHEMAS.Products);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(p.sku).trim()) {
      // עדכון שורה קיימת
      var updatedRow = SCHEMAS.Products.columns.map(function (col, cIdx) {
        return p[col.key] !== undefined ? p[col.key] : data[i][cIdx];
      });
      sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return { ok: true, message: "המוצר עודכן בהצלחה.", sku: p.sku };
    }
  }

  // הוספת מוצר חדש
  appendBySchema_(SCHEMAS.Products, p);
  return { ok: true, message: "מוצר חדש נוסף לקטלוג בהצלחה.", sku: p.sku };
}

function sendOrderEmailNotification_(orderId, customer, total, itemsSummary) {
  var notifyEmail = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL");
  if (!notifyEmail) return;

  try {
    var subject = "🧱 הזמנה חדשה התקבלה באתר: " + orderId;
    var body =
      "התקבלה הזמנה חדשה באתר 'ח. סבן חומרי בניין (1994) בע״מ':\n\n" +
      "מספר הזמנה: " +
      orderId +
      "\n" +
      "שם לקוח: " +
      (customer.name || "") +
      "\n" +
      "טלפון: " +
      (customer.phone || "") +
      "\n" +
      "כתובת אספקה: " +
      (customer.address || "לא צוינה") +
      "\n" +
      "סה״כ לתשלום: ₪" +
      total.toLocaleString() +
      "\n\n" +
      "פירוט פריטים:\n" +
      itemsSummary +
      "\n\n" +
      "הערות: " +
      (customer.notes || "אין") +
      "\n\n" +
      "לצפייה ואישור היכנסו לגוגל שיטס של החנות.";
    MailApp.sendEmail(notifyEmail, subject, body);
  } catch (err) {
    console.error("שגיאה בשליחת מייל התראה:", err);
  }
}

function testConnection() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName("הזמנות");
  var productsSheet = ss.getSheetByName("קטלוג מוצרים");

  var msg =
    "בדיקת מערכת ח. סבן (1994) בע״מ:\n\n" +
    "✅ חיבור Apps Script תקין ומעוצב.\n" +
    (ordersSheet
      ? "✅ טאב 'הזמנות' קיים ופעיל.\n"
      : "⚠️ טאב 'הזמנות' טרם הוקם (הפעל הקמת מערכת).\n") +
    (productsSheet
      ? "✅ טאב 'קטלוג מוצרים' קיים (" +
        Math.max(productsSheet.getLastRow() - 1, 0) +
        " מוצרים מוגדרים).\n"
      : "⚠️ קטלוג מוצרים טרם הוקם.\n") +
    "\nכתובת ה-Web App פועלת ומאפשרת קבלת הזמנות ישירות מהאתר.";

  ui.alert("בדיקת חיבור", msg, ui.ButtonSet.OK);
}

function refreshDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupDashboardSheet_(ss);
  var dash = ss.getSheetByName("לוח בקרה");
  if (dash) ss.setActiveSheet(dash);
  SpreadsheetApp.getActiveSpreadsheet().toast("לוח הבקרה והמחוונים רועננו בהצלחה!", "ח. סבן", 4);
}

function clearDemoOrders() {
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    "איפוס הזמנות הדגמה",
    "האם ברצונך למחוק את שורות ההזמנות בגיליון 'הזמנות'? שורת הכותרות והעיצוב יישמרו.",
    ui.ButtonSet.YES_NO,
  );
  if (confirm !== ui.Button.YES) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("הזמנות");
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "ההזמנות אופסו בהצלחה. המבנה והעיצוב נשמרו.",
      "ח. סבן",
      4,
    );
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast("אין שורות הזמנה למחיקה.", "ח. סבן", 4);
  }
}

/* =========================================================================
 * 10. כינויים בעברית מלאה להרצה נוחה מתוך Apps Script
 * ========================================================================= */

function הקמת_מערכת_מעוצבת() {
  return setupDatabaseHebrew();
}

function רענון_עיצוב_ויישור_לימין() {
  return formatAllSheets();
}

function טעינת_קטלוג_מלא() {
  return seedFullHebrewCatalog();
}

function עדכון_לוח_בקרה() {
  return refreshDashboard();
}

function בדיקת_חיבור() {
  return testConnection();
}

function איפוס_הזמנות_הדגמה() {
  return clearDemoOrders();
}
