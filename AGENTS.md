<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Base44 dev environment

**Stack:** Vite 8 + TanStack Start (SSR via nitro) + React 19 + Tailwind 4. Hebrew RTL luxury e-commerce showroom.

**Run:** `docker compose -f docker-compose.base44.yml up -d` → http://localhost:3000

**No lock file** — `npm install` runs inside the container on first boot (~60s). A named volume `node_modules` caches deps across restarts.

**Vite allowedHosts:** The `@lovable.dev/vite-tanstack-config` plugin does NOT set `server.allowedHosts`, so Vite 8 returns 403 for JS/CSS module requests from the preview's external hostname (the SSR HTML still loads, but the page never hydrates). `vite.config.ts` adds `vite: { server: { allowedHosts: true } }` to fix this. Do not remove it.

**Lovable sandbox mode is NOT active** (no `LOVABLE_SANDBOX=1` env var), so the plugin does not force port 8080 — the CLI args `--host 0.0.0.0 --port 3000` from `npm run dev` take effect.

**External credentials (optional for boot):** `APPS_SCRIPT_URL`, `APPS_SCRIPT_TOKEN` (Google Sheets backend for products/orders/CRM), `GEMINI_API_KEY` / `LOVABLE_API_KEY` (Noah-AI chat). The app renders fully without them; only the chat and Sheets-backed features (live product data, order submission) are non-functional until they are provided. Read server-side via `process.env` in `src/lib/sheets.functions.ts` and `src/routes/api/chat.ts`. Delivered via `/run/base44/app.env` (platform-managed); placeholders in `.env.base44-defaults` let the app boot without them.

**Verify it works:** `curl -sf http://localhost:3000/` returns the SSR HTML. The preview iframe should show the logo splash → showroom homepage.
