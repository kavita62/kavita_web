# Deploy — Kavita Uchila (GitHub + Vercel)

Estratégia: **site 100% estático**. Sem funções serverless, sem build, sem config da Vercel.

## Estado do projeto

- `index.html` — homepage (cópia de `preview.html`), servida automaticamente em `/`
- `preview.html`, `gallery.html`, `project.html`, `admin.html` — páginas estáticas
- `data/site-content.json` — conteúdo do site, lido diretamente pelo frontend
- `uploads/` (293 MB) e `optimized/` — assets estáticos
- `.vercelignore` — exclui `server.js`, código server-side e ferramentas de build
- `package.json` — sem campo `main` e sem script `build` (evita deteção de app Node)
- `pnpm-lock.yaml` / `pnpm-workspace.yaml` — regenerados; `pnpm install --frozen-lockfile` passa

> O frontend foi alterado para buscar `/data/site-content.json` em vez de
> `/api/site-content`. Assim não há rewrites nem funções na Vercel.

## Deploy na Vercel

1. Abre https://vercel.com/new
2. **Import Git Repository** → `kavita62/kavita_web`
3. Framework Preset: **Other** (ou **Static** — não escolhas Express/Node)
4. Root Directory: `./`
5. Build Command / Output Directory: **vazios**
6. **Deploy**

Se o projeto Vercel já existir, faz um **Redeploy** depois do push (Deployments → ⋯ → Redeploy).

## Verificação

- `/` → homepage (título "Kavita Uchila — Image With A Pulse")
- `/gallery.html`, `/project.html`, `/admin.html` → HTTP 200
- `/data/site-content.json` → JSON com 12 projetos

## Performance (P0 + P1)

- `media.js` mapeia `/uploads/<hash>.<ext>` → WebP/AVIF em `optimized/{webp,avif}/uploads/`
- Todas as 142 imagens referenciadas têm versões WebP + AVIF (`scripts/generate-optimized.mjs`)
- `<picture>` com `source` AVIF/WebP + `loading="lazy"` e `decoding="async"`
- Vídeos de galeria/projeto usam `data-src` + IntersectionObserver (preload `none`)
- Deploy envia só WebP/AVIF (~24 MB) — `optimized/original` e `Projectos/` excluídos via `.vercelignore`
- Ganho medido: 174 MB de imagens → ~5 MB (−97%)

## Notas

- O painel admin não persiste alterações na Vercel (filesystem read-only). O site
  público funciona normalmente; alterações locais continuam a funcionar via `npm start`.
- Se aparecer `500 FUNCTION_INVOCATION_FAILED`, confirma que o projeto Vercel está com
  preset **Other/Static** e que o commit mais recente (com `.vercelignore` e sem
  `vercel.json`/`api/`) foi usado no deploy.
