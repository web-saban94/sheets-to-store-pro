import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logChat } from "@/lib/sheets.functions";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "שלום, אני נועה-AI 👋 העוזרת של ח. סבן חומרי בניין. אפשר לשאול אותי על מוצרים, כמויות, זמני ייבוש, שעות פעילות הסניפים ומשלוחים.",
};

export function NoahChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(`s-${Math.random().toString(36).slice(2, 10)}`);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME) }),
      });
      const data = (await res.json()) as { reply?: string };
      const answer = data.reply ?? "אירעה תקלה, אפשר לנסות שוב.";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      logChat({ data: { sessionId: sessionId.current, question, answer } }).catch(() => undefined);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "לא הצלחתי להתחבר כרגע. אפשר להתקשר לסניף ונשמח לעזור." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 end-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        aria-label="פתיחת צ׳אט נועה-AI"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="text-sm">נועה-AI</span>
      </button>

      {open && (
        <div className="frame fixed bottom-24 end-6 z-40 flex h-[32rem] w-[24rem] max-w-[92vw] flex-col overflow-hidden">
          <div className="border-b border-border bg-surface-2 p-4">
            <p className="text-sm font-bold text-platinum">נועה-AI · שירות וייעוץ טכני</p>
            <p className="text-xs text-muted-foreground">התלמיד 6 · החרש 10, הוד השרון</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <p className="animate-pulse text-sm text-muted-foreground">נועה מקלידה…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="איך אפשר לעזור?"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-60"
              aria-label="שליחה"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
