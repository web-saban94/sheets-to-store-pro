import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

export type Category = {
  id: string;
  name: string;
  tagline: string;
  image: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  dryingTime: string;
  coverage: string;
  application: string;
  promo?: string;
  inStock: boolean;
};

export const CATEGORIES: Category[] = [
  { id: "building", name: "חומרי בניין", tagline: "מלט, טיח, בלוקים ואגרגטים", image: hero1 },
  { id: "paint", name: "צבעים וגמר", tagline: "צבעי פנים, חוץ ושפכטל", image: hero2 },
  { id: "sealing", name: "איטום ובידוד", tagline: "ביטומן, אקרילי ופולימרי", image: hero2 },
  { id: "tools", name: "כלי עבודה", tagline: "כלי יד, חשמל ואביזרים", image: hero3 },
];

export const BRANDS = ["נירלט", "טמבור", "פזקר", "כרמית", "נשר", "מפעלי איטונג", "בוש"];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    sku: "NSH-50",
    name: 'מלט פורטלנד נשר CEM II 50 ק"ג',
    brand: "נשר",
    categoryId: "building",
    price: 32,
    unit: "שק",
    image: hero1,
    description: "מלט אפור איכותי לעבודות בטון, טיח ותשתיות. חוזק גבוה ואחידות מלאה.",
    dryingTime: "התקשרות ראשונית 3-4 שעות, אשפרה 28 יום",
    coverage: 'כ-1 מ"ר ביציקה בעובי 5 ס"מ',
    application: "ערבוב במערבל עם מים ביחס 0.5, יישום ביעה או משאבה",
    promo: "מבצע שבועי",
    inStock: true,
  },
  {
    id: "p2",
    sku: "ITG-20",
    name: "בלוק איטונג 20 ס״מ",
    brand: "מפעלי איטונג",
    categoryId: "building",
    price: 14.5,
    unit: "יחידה",
    image: hero1,
    description: "בלוק בטון תאי קל משקל עם בידוד תרמי ואקוסטי מעולה.",
    dryingTime: "דבק מתקשה תוך 2 שעות",
    coverage: 'כ-8 יחידות למ"ר קיר',
    application: "הנחה על דבק איטונג בעזרת כף משוננת 8 מ״מ",
    inStock: true,
  },
  {
    id: "p3",
    sku: "TMB-SUP",
    name: "סופרקריל טמבור 18 ליטר",
    brand: "טמבור",
    categoryId: "paint",
    price: 289,
    unit: "פח",
    image: hero2,
    description: "צבע אקרילי מט לפנים ולחוץ, כיסוי מלא וגוון יציב לאורך שנים.",
    dryingTime: "יבש למגע שעה, מעיל נוסף לאחר 4 שעות",
    coverage: 'עד 10 מ"ר לליטר בשכבה',
    application: "רולר, מברשת או ריסוס — 2 שכבות על שטח נקי ויבש",
    promo: "מבצע שבועי",
    inStock: true,
  },
  {
    id: "p4",
    sku: "NRL-WOD",
    name: "לכה פוליאוריטן נירלט 5 ליטר",
    brand: "נירלט",
    categoryId: "paint",
    price: 249,
    unit: "פח",
    image: hero2,
    description: "לכה שקופה עמידה לעץ פנים וחוץ, גימור משיי יוקרתי.",
    dryingTime: "יבש למגע 3 שעות, ליטוש לאחר 12 שעות",
    coverage: 'כ-12 מ"ר לליטר',
    application: "מברשת שיער טבעי, 2-3 שכבות עם ליטוש בין השכבות",
    inStock: true,
  },
  {
    id: "p5",
    sku: "PZK-BIT",
    name: "ביטומן אלסטומרי פזקר 18 ק״ג",
    brand: "פזקר",
    categoryId: "sealing",
    price: 379,
    unit: "דלי",
    image: hero2,
    description: "איטום גגות ומרפסות בעמידות UV גבוהה וגמישות מלאה.",
    dryingTime: "6 שעות בין שכבות, ייבוש מלא 48 שעות",
    coverage: 'כ-1.5 ק"ג למ"ר בשתי שכבות',
    application: "מריחה במברשת/מגב על יסוד ביטומני, שילוב רשת שריון בפינות",
    inStock: true,
  },
  {
    id: "p6",
    sku: "KRM-ACR",
    name: "איטום אקרילי כרמית לגגות 20 ק״ג",
    brand: "כרמית",
    categoryId: "sealing",
    price: 329,
    unit: "דלי",
    image: hero2,
    description: "ציפוי אקרילי לבן מחזיר קרינה, מקטין חום ואוטם סדקים.",
    dryingTime: "4 שעות בין שכבות",
    coverage: 'כ-1 ק"ג למ"ר',
    application: "2 שכבות מוצלבות ברולר, לאחר ניקוי וייבוש המצע",
    inStock: true,
  },
  {
    id: "p7",
    sku: "BSH-GBH",
    name: "פטישון בוש GBH 2-26",
    brand: "בוש",
    categoryId: "tools",
    price: 1290,
    unit: "יחידה",
    image: hero3,
    description: "פטישון SDS-Plus מקצועי 830W לקידוח בבטון ולחציבה קלה.",
    dryingTime: "—",
    coverage: "קידוח עד 26 מ״מ בבטון",
    application: "שימוש עם מקדחי SDS-Plus, מצב סיבוב/הקשה נבחר",
    promo: "מבצע שבועי",
    inStock: true,
  },
  {
    id: "p8",
    sku: "TLS-MIX",
    name: "מערבל צבע וטיח 1600W",
    brand: "בוש",
    categoryId: "tools",
    price: 649,
    unit: "יחידה",
    image: hero3,
    description: "מערבל ידני דו-מהירותי לערבוב טיח, דבק ובטון.",
    dryingTime: "—",
    coverage: "עד 80 ליטר לערבוב",
    application: "בחירת מוט ערבול לפי צמיגות, מהירות נמוכה בתחילת ערבוב",
    inStock: false,
  },
  {
    id: "p9",
    sku: "PLS-GYP",
    name: "לוח גבס ירוק עמיד מים 1.2x2.6",
    brand: "כרמית",
    categoryId: "building",
    price: 78,
    unit: "לוח",
    image: hero1,
    description: "לוח גבס לחדרים רטובים עם ליבה דוחת מים.",
    dryingTime: "שפכטל מתייבש 12 שעות",
    coverage: 'כ-3.1 מ"ר ללוח',
    application: "הברגה לפרופילי מגן כל 25 ס״מ, סרט וגמר שפכטל",
    inStock: true,
  },
  {
    id: "p10",
    sku: "TMB-SPK",
    name: "שפכטל מוכן טמבור 20 ק״ג",
    brand: "טמבור",
    categoryId: "paint",
    price: 119,
    unit: "דלי",
    image: hero2,
    description: "שפכטל גמר מוכן לשימוש ליישור קירות ותקרות.",
    dryingTime: "8-12 שעות לשכבה",
    coverage: 'כ-1.2 ק"ג למ"ר',
    application: "מריחה בכף פלדה, ליטוש בנייר 120 לפני צבע",
    inStock: true,
  },
  {
    id: "p11",
    sku: "AGG-SND",
    name: 'חול מחצבה ממוין 1 טון (ביג בג)',
    brand: "נשר",
    categoryId: "building",
    price: 240,
    unit: "טון",
    image: hero1,
    description: "חול נקי למילוי, טיח ובטון. אספקה עם מנוף לפי דרישה.",
    dryingTime: "—",
    coverage: 'כ-0.6 מ"ק',
    application: "פריקה במנוף ישירות לאתר",
    inStock: true,
  },
  {
    id: "p12",
    sku: "NRL-EXT",
    name: "צבע חוץ סיליקוני נירלט 18 ליטר",
    brand: "נירלט",
    categoryId: "paint",
    price: 419,
    unit: "פח",
    image: hero2,
    description: "צבע סיליקוני נושם לחזיתות, עמידות גבוהה למזג אוויר.",
    dryingTime: "יבש למגע 2 שעות, שכבה נוספת 6 שעות",
    coverage: 'כ-8 מ"ר לליטר',
    application: "יסוד מקשר ואז 2 שכבות ברולר צמר",
    inStock: true,
  },
];

export const HERO_SLIDES = [
  {
    image: hero1,
    eyebrow: "מאז 1994 · הוד השרון",
    title: "חומרי בניין ברמה מקצועית",
    subtitle: "מלט, בלוקים, אגרגטים ותשתיות — מלאי מלא ואספקה מהירה לאתר.",
    cta: "כניסה לקטגוריית חומרי בניין",
    categoryId: "building",
  },
  {
    image: hero2,
    eyebrow: "צבעים · איטום · גמר",
    title: "מותגי הפרימיום של הענף",
    subtitle: "טמבור, נירלט, פזקר וכרמית — ייעוץ טכני מלא לפני כל רכישה.",
    cta: "כניסה לקטגוריית צבעים",
    categoryId: "paint",
  },
  {
    image: hero3,
    eyebrow: "הובלה ומנוף",
    title: "אספקה עם מנוף עד האתר",
    subtitle: "תיאום פריקה, מנוף ומשלוח באותו יום לאזור השרון.",
    cta: "הזמנת משלוח ומנוף",
    categoryId: "tools",
  },
];

export const BRANCHES = [
  { name: "סניף התלמיד 6, הוד השרון", hours: "א׳-ה׳ 06:30-17:00 · ו׳ 06:30-13:00", phone: "09-7000000" },
  { name: "סניף החרש 10, הוד השרון", hours: "א׳-ה׳ 07:00-17:00 · ו׳ 07:00-13:00", phone: "09-7000001" },
];

export const COUPONS: Record<string, number> = {
  SABAN10: 0.1,
  BUILD5: 0.05,
};
