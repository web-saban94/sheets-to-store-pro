import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `את/ה "נועה-AI", העוזרת הדיגיטלית של חנות "ח. סבן חומרי בניין (1994) בע״מ" בהוד השרון.
עונים תמיד בעברית, בגובה העיניים, קצר וברור (עד 6 שורות), ובנימה מקצועית ואדיבה.
מידע קבוע:
- סניף התלמיד 6, הוד השרון: א׳-ה׳ 06:30-17:00, ו׳ 06:30-13:00.
- סניף החרש 10, הוד השרון: א׳-ה׳ 07:00-17:00, ו׳ 07:00-13:00.
- החנות מספקת משלוחים ופריקה במנוף באזור השרון, בתיאום מראש.
- מותגים: נשר, טמבור, נירלט, פזקר, כרמית, איטונג, בוש.
תפקידך: התאמת מוצרים, ייעוץ טכני (כמויות, זמן ייבוש, כיסוי למ"ר, שיטת יישום), מענה על שעות פעילות ומשלוחים.
אם חסר מידע מדויק על מחיר או מלאי — הצע לפנות לסניף או להוסיף לעגלה ולבקש אישור טלפוני. אל תמציא מחירים.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: Msg[] };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ reply: "שירות הצ׳אט אינו מוגדר כרגע. אפשר להתקשר לסניף ונשמח לעזור." }, { status: 200 });
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [{ role: "system", content: SYSTEM }, ...messages],
          }),
        });

        if (res.status === 429) {
          return Response.json({ reply: "יש עומס רגעי על השירות, אפשר לנסות שוב בעוד רגע." }, { status: 200 });
        }
        if (res.status === 402) {
          return Response.json({ reply: "שירות ה-AI אינו זמין כרגע. נשמח לעזור טלפונית בסניף." }, { status: 200 });
        }
        if (!res.ok) {
          const text = await res.text();
          return Response.json({ reply: "אירעה תקלה זמנית בצ׳אט.", error: text }, { status: 200 });
        }

        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content ?? "לא הצלחתי לנסח תשובה, אפשר לנסות לנסח מחדש?";
        return Response.json({ reply });
      },
    },
  },
});
