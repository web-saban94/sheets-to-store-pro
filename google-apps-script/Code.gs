/**
 * ח. סבן חומרי בניין (1994) בע״מ — Google Sheets Headless Backend + CRM
 * -------------------------------------------------------------------
 * Deploy: Extensions > Apps Script > paste this file > Run `setupDatabase` once
 * (approve permissions), then Deploy > New deployment > Web app >
 * Execute as: Me · Who has access: Anyone.
 * Copy the /exec URL into the app secret APPS_SCRIPT_URL.
 * Optional: Project Settings > Script Properties > API_TOKEN, and store the same
 * value in the app secret APPS_SCRIPT_TOKEN.
 */

var SHEETS = {
  Products: [
    'id', 'sku', 'name', 'brand', 'categoryId', 'price', 'unit', 'imageUrl',
    'description', 'dryingTime', 'coverage', 'application', 'promo', 'inStock',
  ],
  Categories: ['id', 'name', 'tagline', 'imageUrl', 'sortOrder'],
  Brands: ['id', 'name', 'logoUrl', 'active'],
  Orders: [
    'orderId', 'createdAt', 'customerName', 'phone', 'email', 'address',
    'itemsJson', 'delivery', 'crane', 'coupon', 'total', 'status', 'notes',
  ],
  CRM_Customers: [
    'customerId', 'createdAt', 'name', 'company', 'phone', 'email',
    'ordersCount', 'lifetimeValue', 'segment', 'lastContact', 'notes',
  ],
  Chat_Logs: ['timestamp', 'sessionId', 'question', 'answer'],
  Promotions: ['id', 'sku', 'title', 'discountPct', 'startDate', 'endDate', 'active'],
  Rulebook: ['key', 'value', 'notes'],
};

var DEFAULT_RULES = [
  ['delivery_cost', 180, 'עלות משלוח סטנדרטי בש"ח'],
  ['crane_cost', 350, 'עלות פריקה במנוף בש"ח'],
  ['vat_rate', 0.18, 'שיעור מע"מ'],
  ['coupon_SABAN10', 0.10, 'קופון 10% הנחה'],
  ['coupon_BUILD5', 0.05, 'קופון 5% הנחה'],
  ['branch_1', 'התלמיד 6, הוד השרון | א-ה 06:30-17:00 | ו 06:30-13:00', 'סניף ראשי'],
  ['branch_2', 'החרש 10, הוד השרון | א-ה 07:00-17:00 | ו 07:00-13:00', 'סניף שני'],
];

/* ------------------------------ setup -------------------------------- */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    var headers = SHEETS[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#0F172A').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });

  var rulebook = ss.getSheetByName('Rulebook');
  if (rulebook.getLastRow() < 2) {
    rulebook.getRange(2, 1, DEFAULT_RULES.length, 3).setValues(DEFAULT_RULES);
  }
  seedCatalog_();
  return 'Database ready';
}

function seedCatalog_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cats = ss.getSheetByName('Categories');
  if (cats.getLastRow() < 2) {
    cats.getRange(2, 1, 4, 5).setValues([
      ['building', 'חומרי בניין', 'מלט, טיח, בלוקים ואגרגטים', '', 1],
      ['paint', 'צבעים וגמר', 'צבעי פנים, חוץ ושפכטל', '', 2],
      ['sealing', 'איטום ובידוד', 'ביטומן, אקרילי ופולימרי', '', 3],
      ['tools', 'כלי עבודה', 'כלי יד, חשמל ואביזרים', '', 4],
    ]);
  }
  var brands = ss.getSheetByName('Brands');
  if (brands.getLastRow() < 2) {
    var list = ['נשר', 'טמבור', 'נירלט', 'פזקר', 'כרמית', 'מפעלי איטונג', 'בוש'];
    brands.getRange(2, 1, list.length, 4).setValues(list.map(function (b, i) {
      return ['b' + (i + 1), b, '', true];
    }));
  }
  var products = ss.getSheetByName('Products');
  if (products.getLastRow() < 2) {
    products.getRange(2, 1, 2, SHEETS.Products.length).setValues([
      ['p1', 'NSH-50', 'מלט פורטלנד נשר CEM II 50 ק"ג', 'נשר', 'building', 32, 'שק', '',
        'מלט אפור איכותי לעבודות בטון וטיח', 'התקשרות 3-4 שעות, אשפרה 28 יום',
        'כ-1 מ"ר בעובי 5 ס"מ', 'ערבוב במערבל, יישום ביעה או משאבה', 'מבצע שבועי', true],
      ['p3', 'TMB-SUP', 'סופרקריל טמבור 18 ליטר', 'טמבור', 'paint', 289, 'פח', '',
        'צבע אקרילי מט לפנים ולחוץ', 'יבש למגע שעה, שכבה נוספת 4 שעות',
        'עד 10 מ"ר לליטר', 'רולר/מברשת/ריסוס, 2 שכבות', 'מבצע שבועי', true],
    ]);
  }
}

/* ------------------------------ helpers ------------------------------ */

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function rows_(name) {
  var sh = sheet_(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function append_(name, obj) {
  var sh = sheet_(name);
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(headers.map(function (h) { return obj[h] !== undefined ? obj[h] : ''; }));
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function authorized_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  return !expected || expected === token;
}

/* ------------------------------- GET --------------------------------- */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'catalog';
  try {
    if (action === 'catalog') {
      return json_({
        ok: true,
        products: rows_('Products'),
        categories: rows_('Categories'),
        brands: rows_('Brands'),
        promotions: rows_('Promotions'),
      });
    }
    if (action === 'rulebook') return json_({ ok: true, rules: rows_('Rulebook') });
    if (action === 'orders') return json_({ ok: true, orders: rows_('Orders') });
    if (action === 'customer') {
      var phone = String(e.parameter.phone || '');
      var found = rows_('CRM_Customers').filter(function (c) { return String(c.phone) === phone; });
      return json_({ ok: true, customer: found[0] || null });
    }
    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ------------------------------- POST -------------------------------- */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    if (!authorized_(body.token)) return json_({ ok: false, error: 'Unauthorized' });

    var action = body.action;
    var p = body.payload || {};

    if (action === 'createOrder') return json_(createOrder_(p));
    if (action === 'createCustomer') return json_(createCustomer_(p));
    if (action === 'loginCustomer') return json_(loginCustomer_(p));
    if (action === 'logChat') return json_(logChat_(p));
    if (action === 'upsertProduct') return json_(upsertProduct_(p));

    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function createOrder_(p) {
  var orderId = p.orderId || 'SB-' + new Date().getTime();
  var customer = p.customer || {};
  append_('Orders', {
    orderId: orderId,
    createdAt: p.createdAt || new Date().toISOString(),
    customerName: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    itemsJson: JSON.stringify(p.items || []),
    delivery: !!p.delivery,
    crane: !!p.crane,
    coupon: p.coupon || '',
    total: p.total || 0,
    status: 'ממתין לאישור',
    notes: customer.notes || '',
  });
  syncCustomerFromOrder_(customer, p.total || 0);
  notifyOrder_(orderId, customer, p.total || 0);
  return { ok: true, orderId: orderId, message: 'ההזמנה נקלטה במערכת. נציג יחזור אליכם לאישור.' };
}

function syncCustomerFromOrder_(customer, total) {
  var sh = sheet_('CRM_Customers');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][4]) === String(customer.phone)) {
      sh.getRange(i + 1, 7).setValue(Number(data[i][6] || 0) + 1);
      sh.getRange(i + 1, 8).setValue(Number(data[i][7] || 0) + Number(total));
      sh.getRange(i + 1, 10).setValue(new Date().toISOString());
      return;
    }
  }
  append_('CRM_Customers', {
    customerId: 'C-' + new Date().getTime(),
    createdAt: new Date().toISOString(),
    name: customer.name || '',
    company: '',
    phone: customer.phone || '',
    email: customer.email || '',
    ordersCount: 1,
    lifetimeValue: total,
    segment: 'לקוח חדש',
    lastContact: new Date().toISOString(),
    notes: customer.notes || '',
  });
}

function createCustomer_(p) {
  var existing = rows_('CRM_Customers').filter(function (c) { return String(c.phone) === String(p.phone); });
  if (existing.length) return { ok: true, message: 'הלקוח כבר קיים במערכת.', customer: existing[0] };
  append_('CRM_Customers', {
    customerId: 'C-' + new Date().getTime(),
    createdAt: new Date().toISOString(),
    name: p.name || '',
    company: p.company || '',
    phone: p.phone || '',
    email: p.email || '',
    ordersCount: 0,
    lifetimeValue: 0,
    segment: 'ליד',
    lastContact: new Date().toISOString(),
    notes: '',
  });
  return { ok: true, message: 'כרטיס הלקוח נוצר בהצלחה.' };
}

function loginCustomer_(p) {
  var found = rows_('CRM_Customers').filter(function (c) { return String(c.phone) === String(p.phone); });
  if (!found.length) return { ok: false, message: 'לא נמצא כרטיס לקוח עם הטלפון הזה.' };
  return { ok: true, message: 'ברוך שובך, ' + (found[0].name || '') + '!', customer: found[0] };
}

function logChat_(p) {
  append_('Chat_Logs', {
    timestamp: p.createdAt || new Date().toISOString(),
    sessionId: p.sessionId || '',
    question: p.question || '',
    answer: p.answer || '',
  });
  return { ok: true };
}

function upsertProduct_(p) {
  var sh = sheet_('Products');
  var data = sh.getDataRange().getValues();
  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(p.sku)) {
      sh.getRange(i + 1, 1, 1, headers.length).setValues([
        headers.map(function (h, idx) { return p[h] !== undefined ? p[h] : data[i][idx]; }),
      ]);
      return { ok: true, updated: true };
    }
  }
  append_('Products', p);
  return { ok: true, created: true };
}

function notifyOrder_(orderId, customer, total) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  MailApp.sendEmail(to, 'הזמנה חדשה ' + orderId,
    'לקוח: ' + (customer.name || '') + '\nטלפון: ' + (customer.phone || '') + '\nסה"כ: ' + total);
}
