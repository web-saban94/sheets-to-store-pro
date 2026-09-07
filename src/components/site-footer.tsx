import { BRANCHES } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-black text-platinum">ח. סבן חומרי בניין (1994) בע״מ</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            למעלה משלושה עשורים מספקים לקבלנים, שיפוצניקים ולקוחות פרטיים חומרי בניין, צבעים, איטום וכלי
            עבודה — עם ייעוץ טכני מקצועי ואספקה מהירה.
          </p>
        </div>
        {BRANCHES.map((b) => (
          <div key={b.name}>
            <p className="font-bold text-platinum">{b.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{b.hours}</p>
            <a href={`tel:${b.phone}`} className="mt-1 block text-sm text-primary">
              {b.phone}
            </a>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ח. סבן חומרי בניין (1994) בע״מ · כל הזכויות שמורות
      </div>
    </footer>
  );
}
