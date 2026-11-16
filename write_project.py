content = '''<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
<meta name="theme-color" content="#080808" />
<meta name="description" content="Kavita Uchila — visual studio for music, fashion and culture." />
<title>Kavita Uchila — Project</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
:root {
  --lime: #e9ff2f;
  --ink: #080808;
  --paper: #e9ff2f;
  --paper-soft: #d8ed2c;
  --white: #f6f5ee;
  --muted: rgba(246, 245, 238, 0.58);
  --line: rgba(246, 245, 238, 0.22);
  --mono: "DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --sans: "Space Grotesk", Arial, Helvetica, sans-serif;
  color: var(--white);
  background: var(--ink);
  font-family: var(--sans);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--ink); }
body { margin: 0; min-width: 320px; background: var(--ink); }
a { color: inherit; text-decoration: none; }
button { border: 0; font: inherit; }
::selection { color: var(--ink); background: var(--paper); }

.site-shell { min-height: 100vh; background: var(--ink); position: relative; }
.grain { position: fixed; inset: 0; z-index: 20; pointer-events: none; opacity: .065; mix-blend-mode: screen; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E"); }

.topbar { position: fixed; z-index: 30; top: 0; left: 0; right: 0; height: 76px; display: flex; align-items: center; justify-content: space-between; padding: 0 3.2vw; color: var(--white); mix-blend-mode: difference; }
.topbar__brand { flex: 0 0 auto; }
.eyebrow, .section-number { font: 10px/1.15 var(--mono); letter-spacing: .11em; text-transform: uppercase; }
.topnav { display: flex; align-items: center; gap: 2.3vw; }
.topnav a { font: 11px/1 var(--mono); letter-spacing: .1em; transition: color .2s ease; }
.topnav a:hover { color: var(--paper); }
.topnav a span { color: var(--paper); font-size: 8px; margin-left: 4px; }
.menu-toggle { display: none; padding: 8px; background: transparent; color: var(--white); }

.brand-mark { display: inline-flex; align-items: center; gap: 8px; font: 700 17px/.9 var(--sans); letter-spacing: -.08em; }
.brand-mark > span:not(.brand-mark__face) { display: block; }
.brand-mark > span:last-child { margin-left: -5px; }
.brand-mark__face { width: 27px; height: 27px; border: 1.6px solid currentColor; border-radius: 50%; position: relative; display: inline-block; flex: 0 0 auto; }
.brand-mark__face i { width: 3px; height: 3px; background: currentColor; border-radius: 50%; position: absolute; top: 8px; }
.brand-mark__face i:first-child { left: 7px; }
.brand-mark__face i:nth-child(2) { right: 7px; }
.brand-mark__face b { width: 10px; height: 5px; border-bottom: 1.4px solid currentColor; border-radius: 0 0 50% 50%; position: absolute; left: 7px; top: 12px; }

.project-page { min-height: 100vh; padding-top: 76px; }

.project-nav { display: flex; align-items: center; justify-content: space-between; padding: 2rem 3.2vw 1rem; gap: 1rem; flex-wrap: wrap; }
.project-nav__brand { font: 700 17px/.9 var(--sans); letter-spacing: -.08em; color: var(--paper); }
.project-nav__crumb { color: var(--muted); font: 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; }
.project-nav__back { display: inline-flex; align-items: center; gap: 6px; color: var(--white); font: 9px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; }

.project-hero { position: relative; min-height: 65vh; display: flex; flex-direction: column; justify-content: center; padding: 4rem 3.2vw 6rem; overflow: hidden; }
.project-hero__video { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(.72) contrast(1.1); transform: scale(1.025); pointer-events: none; }
.project-hero__cover-video { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(.6) contrast(1.05) brightness(.7); pointer-events: none; }
.project-hero__wash { position: absolute; z-index: -1; inset: 0; background: linear-gradient(180deg, rgba(8,8,8,.4), transparent 40%, rgba(8,8,8,.82)); pointer-events: none; }
.project-hero__index { font: 9px/1 var(--mono); letter-spacing: .1em; color: var(--muted); text-transform: uppercase; margin-bottom: 1rem; }
.project-hero__index i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--paper); margin: 0 6px; vertical-align: middle; }
.project-hero__title { max-width: 720px; }
.project-hero__title .eyebrow { color: var(--paper); margin-bottom: 1rem; }
.project-hero__title h1 { margin: 0; font-size: clamp(4rem, 12vw, 12rem); line-height: .72; font-weight: 700; letter-spacing: -.12em; color: var(--paper); }
.project-hero__tag { display: block; margin-top: 1.5rem; font: 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--paper); }
.project-hero__sound { margin-top: 3rem; display: inline-flex; align-items: center; gap: 10px; padding: 14px 20px; border: 1px solid var(--paper); color: var(--ink); background: var(--paper); font: 10px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; width: fit-content; }
.project-hero__sound:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(233,255,47,.14); }

.project-info { padding: 4rem 3.2vw; max-width: 980px; margin: 0 auto; }
.project-info__label { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
.section-number { color: var(--paper); }
.project-info__description { font-size: clamp(1.1rem, 2.5vw, 1.5rem); line-height: 1.5; color: var(--white); margin-bottom: 3rem; max-width: 720px; }
.project-info__details { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }
.project-info__details div { display: flex; flex-direction: column; gap: 6px; }
.project-info__details dt { color: var(--muted); font: 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; }
.project-info__details dd { margin: 0; font-size: clamp(1rem, 1.5vw, 1.2rem); line-height: 1.3; color: var(--white); }

.project-frames { padding: 0 3.2vw 6rem; max-width: 1440px; margin: 0 auto; }
.project-frames--cinematic { display: flex; flex-direction: column; gap: 4rem; }
.project-frames--editorial { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
.project-frames--gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.project-frames--split { display: flex; flex-direction: column; gap: 3rem; }
.project-frames--fullscreen { display: flex; flex-direction: column; gap: 4rem; }

.project-frame { position: relative; overflow: hidden; }
.project-frame--wide { aspect-ratio: 21 / 9; }
.project-frame--portrait { aspect-ratio: 9 / 16; }
.project-frame--square { aspect-ratio: 1 / 1; }
.project-frame--fullscreen { aspect-ratio: 16 / 9; }
.project-frame--split { aspect-ratio: 2 / 1; }

.project-frame__media { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: #111; }
.project-frame__media video, .project-frame__media img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(.9) contrast(1.02); }
.project-frame__media--text { min-height: 40vh; padding: clamp(2rem, 7vw, 7rem); display: flex; align-items: center; background: var(--lime); color: var(--ink); font-size: clamp(1.5rem, 4vw, 3rem); line-height: 1.1; font-weight: 600; letter-spacing: -.04em; }

.project-frame__copy { position: relative; z-index: 2; padding: 2rem 1.5rem; background: var(--ink); }
.project-frame__copy strong { display: block; font: 600 14px/1.3 var(--sans); letter-spacing: -.02em; color: var(--paper); margin-bottom: .5rem; }
.project-frame__copy p { margin: 0; color: var(--white); line-height: 1.6; }

.project-strip { padding: 4rem 3.2vw; background: rgba(246,245,238,.02); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.project-strip__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2rem; }
.project-strip__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.project-thumb { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border: 1px solid var(--line); background: #111; transition: transform .3s ease, border-color .3s ease; }
.project-thumb:hover { transform: translateY(-4px); border-color: var(--paper); }
.project-thumb__cover-video { position: absolute; z-index: 1; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(.6) contrast(1.05) brightness(.7); pointer-events: none; transition: filter .4s ease, transform .6s ease; }
.project-thumb video { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(.3) saturate(.8) contrast(1.05); transition: filter .4s ease, transform .6s ease; }
.project-thumb:hover .project-thumb__cover-video { filter: saturate(1) contrast(1.05) brightness(.8); transform: scale(1.05); }
.project-thumb:hover video { filter: grayscale(0) saturate(1) contrast(1.05); transform: scale(1.05); }
.project-thumb span { position: absolute; bottom: 1rem; left: 1rem; right: 1rem; font: 9px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--paper); z-index: 1; }
.project-thumb strong { position: absolute; bottom: 3rem; left: 1rem; right: 1rem; font-size: clamp(1.1rem, 2.5vw, 1.5rem); line-height: 1.1; font-weight: 600; color: var(--white); z-index: 1; }
.project-thumb svg { position: absolute; bottom: 1rem; right: 1rem; width: 28px; height: 28px; color: var(--paper); z-index: 1; }

.project-footer { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 2rem; padding: 3rem 3.2vw; }
.project-footer__control { display: flex; align-items: center; gap: 1rem; color: var(--white); text-decoration: none; }
.project-footer__control:hover { color: var(--paper); }
.project-footer__control svg { flex-shrink: 0; }
.project-footer__control span { font: 9px/1.2 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.project-footer__control strong { display: block; font: 600 clamp(1rem, 1.5vw, 1.3rem)/1.2 var(--sans); letter-spacing: -.04em; color: var(--white); }
.project-footer__control--next { justify-content: flex-end; }
.project-footer__center { text-align: center; }
.project-footer__center strong { display: block; font: 700 17px/.9 var(--sans); letter-spacing: -.08em; color: var(--paper); }
.project-footer__center small { font: 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }

@media (max-width: 900px) {
  .project-hero { min-height: 55vh; padding: 3rem 5vw 4rem; }
  .project-hero__title h1 { font-size: clamp(3rem, 14vw, 8rem); }
  .project-info { padding: 3rem 5vw; }
  .project-frames { padding: 0 5vw 4rem; }
  .project-strip { padding: 3rem 5vw; }
  .project-footer { grid-template-columns: 1fr; text-align: center; }
  .project-footer__control { justify-content: center; }
  .project-footer__control--next { justify_content: center; }
}
</style>
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="site-shell">
  <header class="topbar" role="banner">
    <a href="preview.html" class="topbar__brand brand-mark"><span>KAVITA</span><span class="brand-mark__face"><i></i><i></i><b></b></span><span>UCHILA</span></a>
    <nav class="topnav" role="navigation" aria-label="Principal">
      <a href="preview.html">INÍCIO<span>01</span></a>
      <a href="preview.html#work">TRABALHOS<span>02</span></a>
      <a href="preview.html#about">SOBRE<span>03</span></a>
      <a href="preview.html#contact">CONTACTO<span>04</span></a>
    </nav>
  </header>

  <main class="project-page" id="projectMain">
    <!-- conteúdo injectado por JS -->
  </main>
</div>

<script>
/* ============================================================
   CONTEUDO DO PAINEL — carrega via API /api/site-content (fallback localStorage + IndexedDB)
   ============================================================ */
var ADMIN_KEY = "kavita-admin-content";
var mediaCache = {};

// Load from API, fallback to localStorage
async function loadSiteContent() {
  try {
    var res = await fetch('/api/site-content');
    if (res.ok) {
      var data = await res.json();
      if (data && Array.isArray(data.projects) && data.homepage) return data;
    }
  } catch (e) {}
  // Fallback to localStorage
  try {
    var raw = localStorage.getItem(ADMIN_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.projects) && parsed.homepage) return parsed;
    }
  } catch (e) {}
  return null;
}

function openMediaDb() {
  return new Promise(function (resolve) {
    if (!("indexedDB" in window)) { resolve(null); return; }
    var req = indexedDB.open("kavita-media", 1);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains("files")) req.result.createObjectStore("files");
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { resolve(null); };
  });
}

function readMediaBlob(key) {
  return openMediaDb().then(function (db) {
    if (!db) return null;
    return new Promise(function (resolve) {
      var tx = db.transaction("files", "readonly");
      var req = tx.objectStore("files").get(key);
      req.onsuccess = function () { db.close(); resolve(req.result || null); };
      req.onerror = function () { db.close(); resolve(null); };
    });
  });
}

function resolveMedia(state) {
  var pending = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;
    Object.keys(node).forEach(function (key) {
      var value = node[key];
      if (typeof value === "string" && value.indexOf("idb:") === 0) {
        var mediaKey = value.slice(4);
        if (mediaCache[mediaKey] !== undefined) { node[key] = mediaCache[mediaKey]; return; }
        pending.push(readMediaBlob(mediaKey).then(function (blob) {
          var url = blob ? URL.createObjectURL(blob) : "";
          mediaCache[mediaKey] = url;
          node[key] = url;
        }));
      } else if (value && typeof value === "object") {
        walk(value);
      }
    });
  }
  walk(state);
  return Promise.all(pending).then(function () { return state; });
}

var pad = function (n) { return String(n).padStart(2, "0"); };

/* pega o ID da URL: project.html?id=... ou project.html#... */
function getProjectIdFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  if (id) return id;
  var hash = window.location.hash.slice(1);
  if (hash) return hash;
  return null;
}

function escapeHtml(text) {
  return String(text == null ? "" : text).replace(/[&<>"']/g, function (c) {
    return { "&": "&", "<": "<", ">": ">", '"': """, "'": "'" }[c];
  });
}

function renderProject(project) {
  if (!project) {
    document.getElementById("projectMain").innerHTML =
      '<div style="padding: 6rem 2rem; text-align: center; color: var(--muted);">Projeto não encontrado.</div>';
    return;
  }

  var template = project.template || "cinematic";
  var frames = project.frames || [];

  var nav = '<nav class="project-nav" role="navigation" aria-label="Navegação do projeto">' +
    '<a href="preview.html" class="project-nav__brand brand-mark"><span>KAVITA</span><span class="brand-mark__face"><i></i><i></i><b></b></span><span>UCHILA</span></a>' +
    '<span class="project-nav__crumb">TRABALHO / ' + escapeHtml(project.label) + '</span>' +
    '<a href="preview.html#work" class="project-nav__back"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> TODOS OS TRABALHOS</a>' +
    '</nav>';

  var hero = '<section class="project-hero" aria-label="Vídeo principal do projeto">' +
    (project.coverVideo
      ? '<video class="project-hero__cover-video" src="' + escapeHtml(project.coverVideo) + '" muted loop autoplay playsinline preload="metadata"></video>'
      : '<video class="project-hero__video" src="' + escapeHtml(project.video) + '"' + (project.coverImage ? ' poster="' + escapeHtml(project.coverImage) + '"' : '') + ' muted loop autoplay playsinline preload="metadata"></video>') +
    '<div class="project-hero__wash"></div>' +
    '<div class="project-hero__index">' + escapeHtml(project.label) + '<i></i>' + escapeHtml(String(frames.length || 0).padStart(2, "0")) + '</div>' +
    '<div class="project-hero__title">' +
      '<span class="eyebrow">KAVITA UCHILA / ' + escapeHtml(project.role || "IMAGEM EM MOVIMENTO / DIRECÇÃO DE ARTE") + '</span>' +
      '<h1>' + escapeHtml(project.title) + '</h1>' +
      '<span class="project-hero__tag">' + escapeHtml(project.tag) + '</span>' +
    '</div>' +
    '<button class="project-hero__sound" type="button" onclick="window.location.href=\'preview.html#contact\'">COMEÇAR UM SINAL <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg></button>' +
    '</section>';

  var info = '<section class="project-info" aria-label="Informação do projeto">' +
    '<div class="project-info__label"><span class="section-number">01</span><span class="eyebrow">NOTA DO TRABALHO</span></div>' +
    '<p class="project-info__description">' + escapeHtml(project.description || "Um fragmento de imagem em movimento com um pulso próprio.") + '</p>' +
    '<dl class="project-info__details">' +
      '<div><dt>FUNÇÃO</dt><dd>' + escapeHtml(project.role || "IMAGEM EM MOVIMENTO / DIRECÇÃO DE ARTE") + '</dd></div>' +
      '<div><dt>LOCALIZAÇÃO</dt><dd>' + escapeHtml(project.location || "LUANDA / MUNDO") + '</dd></div>' +
      '<div><dt>ANO</dt><dd>' + escapeHtml(project.year || "2026") + '</dd></div>' +
    '</dl>' +
    '</section>';

  var framesHtml = "";
  if (frames.length) {
    framesHtml = '<section class="project-frames project-frames--' + template + '" aria-label="Quadros do trabalho">';
    frames.forEach(function (f) {
      var mediaHtml = "";
      if (f.mediaType === "text") {
        mediaHtml = '<div class="project-frame__media project-frame__media--text">' + escapeHtml(f.body) + '</div>';
      } else if (f.mediaType === "video") {
        mediaHtml = '<div class="project-frame__media"><video src="' + escapeHtml(f.src) + '" muted loop autoplay playsinline preload="metadata"></video></div>';
      } else {
        mediaHtml = '<div class="project-frame__media"><img src="' + escapeHtml(f.src) + '" alt="' + escapeHtml(f.caption || project.title) + '" /></div>';
      }
      var copyHtml = "";
      if (f.caption || f.body) {
        copyHtml = '<div class="project-frame__copy">' + (f.caption ? '<strong>' + escapeHtml(f.caption) + '</strong>' : '') + (f.body ? '<p>' + escapeHtml(f.body) + '</p>' : '') + '</div>';
      }
      framesHtml += '<article class="project-frame project-frame--' + (f.layout || "wide") + '">' + mediaHtml + copyHtml + '</article>';
    });
    framesHtml += '</section>';
  }

  /* outros projetos para strip */
  var state = window.__adminState;
  var allProjects = [];
  if (state && Array.isArray(state.projects)) {
    allProjects = state.projects.filter(function (p) { return p.published && p.id !== project.id; }).slice(0, 3);
  }

  var strip = "";
  if (allProjects.length) {
    strip = '<section class="project-strip" aria-label="Mais trabalhos">' +
      '<div class="project-strip__head"><span class="eyebrow">MAIS IMAGEM EM MOVIMENTO</span><span>' + escapeHtml(String(allProjects.length).padStart(2, "0")) + ' FRAGMENTOS</span></div>' +
      '<div class="project-strip__grid">';
    allProjects.forEach(function (p) {
      var pLabel = escapeHtml((p.index || "01") + " / " + (p.label || "TRABALHO"));
      var pCoverVideo = p.coverVideo ? p.coverVideo : "";
      strip += '<a href="project.html?id=' + escapeHtml(p.id) + '" class="project-thumb">' +
        (pCoverVideo
          ? '<video class="project-thumb__cover-video" src="' + escapeHtml(pCoverVideo) + '" muted loop autoplay playsinline preload="metadata"></video>'
          : '<video src="' + escapeHtml(p.video) + '"' + (p.coverImage ? ' poster="' + escapeHtml(p.coverImage) + '"' : '') + ' muted loop autoplay playsinline preload="metadata"></video>') +
        '<span>' + pLabel + '</span>' +
        '<strong>' + escapeHtml(p.title) + '</strong>' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>' +
      '</a>';
    });
    strip += '</div></section>';
  }

  /* nav anterior/próximo */
  var publishedIds = [];
  if (state && Array.isArray(state.projects)) {
    publishedIds = state.projects.filter(function (p) { return p.published; }).map(function (p) { return p.id; });
  }
  var idx = publishedIds.indexOf(project.id);
  var prevId = publishedIds[(idx - 1 + publishedIds.length) % publishedIds.length] || "";
  var nextId = publishedIds[(idx + 1) % publishedIds.length] || "";
  var prevProject = state && state.projects.find(function (p) { return p.id === prevId; });
  var nextProject = state && state.projects.find(function (p) { return p.id === nextId; });

  var footer = '<footer class="project-footer">' +
    (prevProject ? '<a href="project.html?id=' + escapeHtml(prevId) + '" class="project-footer__control"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>ANTERIOR<br /><strong>' + escapeHtml(prevProject.title) + '</strong></span></a>' : '<div></div>') +
    '<div class="project-footer__center"><strong>KAVITA UCHILA</strong><br /><small>IMAGEM COM PULSO</small></div>' +
    (nextProject ? '<a href="project.html?id=' + escapeHtml(nextId) + '" class="project-footer__control project-footer__control--next"><span>PRÓXIMO<br /><strong>' + escapeHtml(nextProject.title) + '</strong></span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>' : '<div></div>') +
    '</footer>';

  document.getElementById("projectMain").innerHTML = nav + hero + info + framesHtml + strip + footer;
}

/* boot */
var projectId = getProjectIdFromUrl();
loadSiteContent().then(function (panel) {
  if (panel) {
    resolveMedia(panel).then(function (resolved) {
      window.__adminState = resolved;
      var project = null;
      if (projectId) {
        project = resolved.projects.find(function (p) { return p.id === projectId && p.published; });
      }
      if (!project && resolved.projects.length) {
        project = resolved.projects.find(function (p) { return p.published; });
      }
      renderProject(project);
    }).catch(function () {
      // Se resolveMedia falhar, usa o panel como está
      window.__adminState = panel;
      var project = null;
      if (projectId) {
        project = panel.projects.find(function (p) { return p.id === projectId && p.published; });
      }
      if (!project && panel.projects.length) {
        project = panel.projects.find(function (p) { return p.published; });
      }
      renderProject(project);
    });
  } else {
    /* fallback seed data */
    var seed = {
      projects: [
        { id: "piano-40390", index: "01", label: "MÚSICA", title: "Mãos no som", tag: "ESTÚDIO / RITMO", description: "Um estudo táctil de mãos, ritmo e da electricidade silenciosa de uma sala antes da primeira nota.", role: "DIRECÇÃO VISUAL / IMAGEM EM MOVIMENTO", location: "LUANDA / MUNDO", year: "2026", duration: 20, video: "https://cdn.pixabay.com/video/2020/05/28/40390-425442522_medium.mp4", coverImage: "", coverVideo: "", template: "cinematic", frames: [], pageURL: "", featured: false, published: true, sortOrder: 0 },
        { id: "portrait-316579", index: "02", label: "RETRATO", title: "Novas silhuetas", tag: "MODA / FORMA", description: "Retratos que se movem como tecido: directos, íntimos e construídos no instante em que uma silhueta se torna presença.", role: "CAMPANHA / DIRECÇÃO DE ARTE", location: "LUANDA / MUNDO", year: "2026", duration: 6, video: "https://cdn.pixabay.com/video/2025/11/17/316579_medium.mp4", coverImage: "", coverVideo: "", template: "editorial", frames: [], pageURL: "", featured: true, published: true, sortOrder: 1 },
        { id: "dance-75547", index: "03", label: "MOVIMENTO", title: "Corpos no frame", tag: "PERFORMANCE / ENERGIA", description: "Corpos em movimento, cortados pelo beat. Um fragmento sobre energia, libertação e a forma de um gesto.", role: "PERFORMANCE / EDITORIAL", location: "LUANDA / MUNDO", year: "2026", duration: 17, video: "https://cdn.pixabay.com/video/2021/05/28/75547-556034400_medium.mp4", coverImage: "", coverVideo: "", template: "gallery", frames: [], pageURL: "", featured: false, published: true, sortOrder: 2 },
        { id: "fashion-362758", index: "04", label: "EDITORIAL", title: "A luz encontra a pele", tag: "CAMPANHA / TEXTURA", description: "Um estudo sobre a luz a encontrar a pele, a textura e a geometria imperfeita de um frame em movimento.", role: "CRIAÇÃO DE IMAGEM / DIRECÇÃO", location: "LUANDA / MUNDO", year: "2026", duration: 12, video: "https://cdn.pixabay.com/video/2026/07/08/362758_medium.mp4", coverImage: "", coverVideo: "", template: "split", frames: [], pageURL: "", featured: false, published: true, sortOrder: 3 },
        { id: "dj-13071", index: "05", label: "SOM", title: "Depois do beat", tag: "MÚSICA / ATITUDE", description: "Depois do beat, a imagem continua a mover-se. O som torna-se postura, cor e uma sala cheia de sinal.", role: "MÚSICA / SISTEMA VISUAL", location: "LUANDA / MUNDO", year: "2026", duration: 15, video: "https://cdn.pixabay.com/video/2017/11/26/13071-244835811_medium.mp4", coverImage: "", coverVideo: "", template: "cinematic", frames: [], pageURL: "", featured: false, published: true, sortOrder: 4 },
        { id: "studio-33517", index: "06", label: "PESSOAS", title: "O grande plano", tag: "RETRATO / PRESENÇA", description: "Um grande plano nunca está parado. Um retrato de atenção, proximidade e dos detalhes que ficam connosco.", role: "RETRATO / IMAGEM EM MOVIMENTO", location: "LUANDA / MUNDO", year: "2026", duration: 13, video: "https://cdn.pixabay.com/video/2020/03/11/33517-397143847_medium.mp4", coverImage: "", coverVideo: "", template: "editorial", frames: [], pageURL: "", featured: false, published: true, sortOrder: 5 }
      ],
      homepage: {}
    };
    window.__adminState = seed;
    var project = seed.projects.find(function (p) { return p.id === projectId && p.published; });
    if (!project) project = seed.projects.find(function (p) { return p.published; });
    renderProject(project);
  }
});
</script>
</body>
</html>
'''

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'w') as f:
    f.write(content)
print('Done')