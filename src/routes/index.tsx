import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, Wrench, Sparkles } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { BRANDS, BRANCHES, CATEGORIES, PRODUCTS } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ח. סבן חומרי בניין (1994) — חומרי בניין, צבעים ואיטום בהוד השרון" },
      {
        name: "description",
        content:
          "חנות חומרי בניין מקצועית בהוד השרון: מלט, בלוקים, צבעים, איטום וכלי עבודה, עם משלוח ומנוף וייעוץ טכני.",
      },
      { property: "og:title", content: "ח. סבן חומרי בניין (1994) בע״מ" },
      {
        property: "og:description",
        content: "קטלוג מקצועי, עגלת קנייה חכמה וייעוץ טכני עם נועה-AI. שני סניפים בהוד השרון.",
      },
    ],
  }),
  component: Index,
});

const BENEFITS = [
  { icon: Truck, title: "משלוח ומנוף", text: "אספקה לאתר באזור השרון, פריקה במנוף בתיאום מראש." },
  { icon: ShieldCheck, title: "מותגי פרימיום", text: "נשר, טמבור, נירלט, פזקר, כרמית, איטונג ובוש." },
  { icon: Wrench, title: "ייעוץ טכני", text: "התאמת מוצר, כמויות וזמני ייבוש לכל פרויקט." },
  { icon: Sparkles, title: "מבצעי שבוע", text: "מחירי קבלן מתעדכנים מדי שבוע בקטלוג." },
];

function Index() {
  const promos = PRODUCTS.filter((p) => p.promo).slice(0, 3);

  return (
    <>
      <HeroCarousel />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className="frame p-6">
            <b.icon className="size-6 text-primary" />
            <h2 className="mt-4 text-base font-bold text-platinum">{b.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="text-2xl font-black text-platinum sm:text-3xl">קטגוריות</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to="/catalog" search={{ category: c.id }} className="frame group overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden border-b border-border">
                <img
                  src={c.image}
                  alt={c.name}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-platinum">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black text-platinum sm:text-3xl">מבצעי השבוע</h2>
          <Link to="/catalog" className="text-sm font-semibold text-primary">
            לכל המוצרים →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="frame flex flex-wrap items-center justify-center gap-x-10 gap-y-4 p-8">
          {BRANDS.map((b) => (
            <span key={b} className="text-lg font-bold tracking-wide text-muted-foreground">
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:grid-cols-2">
        {BRANCHES.map((b) => (
          <div key={b.name} className="frame p-7">
            <h2 className="text-xl font-bold text-platinum">{b.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{b.hours}</p>
            <a href={`tel:${b.phone}`} className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              חיוג לסניף {b.phone}
            </a>
          </div>
        ))}
      </section>
    </>
  );
}
