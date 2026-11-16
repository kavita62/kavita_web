# Deploy — Kavita Uchila (GitHub + Vercel)

Estratégia: **site estático primeiro**. O site público funciona na Vercel; o painel admin
não persiste alterações (filesystem da Vercel é read-only).

## O que já está preparado no projeto

- `.gitignore` — exclui `node_modules/`, temporários, logs, `optimized/` (168 MB, ainda não usado)
- `vercel.json` — reescreve `/` e `/preview` para `preview.html`, e **desativa install/build**
  da Vercel (o `pnpm-lock.yaml` está desatualizado face ao `package.json`, e o deploy
  não precisa de dependências: é site estático + uma função Node sem dependências)
- `api/site-content.js` — expõe `data/site-content.json` em `/api/site-content`
- `uploads/` (293 MB) permanece no repo — é usado pelo site

## Antes de começar

> Este ambiente não tem `git`, `gh` nem `vercel` instalados, e não tem credenciais.
> Os comandos abaixo têm de correr onde essas ferramentas existam (ou instala-as:
> `pkg install git` / `apt install git` no Android; `npm i -g vercel` para a CLI).

## 1. Criar o repositório no GitHub

1. Abre https://github.com/new
2. Owner: `kavita62`
3. Repository name: `kavita_web`  (ou outro nome, se esse já existir)
4. Escolhe **Public** (recomendado — evita problemas de acesso no import e no deploy)
5. **Não** inicializes com README/.gitignore (já temos ficheiros locais)

> Nota: o remote local aponta para `https://github.com/kavita62/kavita_web.git` e um
> fetch recente funcionou — ou seja, esse repo privado já existe. Se queres usar outro
> nome, troca a URL no passo 2.

## 2. Fazer push do código

```bash
cd "/home/kavita/Desktop/kavita web/kavita_web"
git init
git add .
git commit -m "Initial commit: Kavita Uchila site"
git branch -M main
git remote add origin https://github.com/kavita62/kavita_web.git
git push -u origin main
```

Se o remote já existir, usa `git remote set-url origin <URL>` em vez de `add`.
Para autenticar em HTTPS, o GitHub exige um **Personal Access Token** como password
(scopes: `repo` para repo privado, ou `public_repo` para público).

## 3. Deploy na Vercel

### Opção A — browser (mais simples)
1. Abre https://vercel.com/new
2. **Import Git Repository** → seleciona `kavita62/kavita_web`
   (se não aparecer, autoriza a GitHub App da Vercel na conta/organização)
3. Framework Preset: **Other**
4. Root Directory: `./`
5. Build Command e Install Command: **vazios** (já ignorados via `vercel.json`)
   |  Output Directory: **vazio**
6. Clica **Deploy**

> Se a Vercel ainda correr `pnpm install` e der `ERR_PNPM_OUTDATED_LOCKFILE`, confirma
> que o `vercel.json` da pasta raiz foi incluído no push. Alternativa: apagar
> `pnpm-lock.yaml` e `package-lock.json` do repo, ou regenerar o lockfile com
> `pnpm install --no-frozen-lockfile`.

### Opção B — CLI
```bash
npm i -g vercel
cd "/home/kavita/Desktop/kavita web/kavita_web"
vercel          # deploy de preview
vercel --prod   # deploy de produção
```

## 4. Verificar

- `/` → homepage (`preview.html`)
- `/gallery.html`, `/project.html`, `/admin.html` → páginas estáticas
- `/api/site-content` → JSON com 12 projetos
- `/uploads/<hash>.jpg` → assets servidos diretamente

## Limitações conhecidas

- O **admin não guarda alterações** na Vercel. Para persistência é preciso migar
  conteúdo/uploads para Vercel Blob + KV/Postgres (trabalho extra + tokens).
- O site tem fallback para `localStorage`/IndexedDB se a API falhar.
- Se o repo ficar muito pesado (293 MB de uploads), considera Git LFS ou mover os
  assets para Vercel Blob/Cloudinary.
