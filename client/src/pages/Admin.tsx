import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Film, LayoutDashboard, LogOut, Plus, Save, Settings2, Trash2, Upload, UserRound, X, RefreshCw, Database, FileText } from "lucide-react";
import { Link } from "wouter";

function StorageManifests() {
  const [manifests, setManifests] = useState<Array<{ projectId: string; fileCount: number; updatedAt: string }>>([]);
  const [selectedManifest, setSelectedManifest] = useState<{ projectId: string; files: Array<{ hash: string; canonicalName: string; originalName: string; size: number; url: string; addedAt: string }> } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadManifests();
  }, []);

  async function loadManifests() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/storage/manifests", { credentials: "include" });
      const data = await response.json();
      setManifests(data.manifests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadManifestFiles(projectId: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/project/${projectId}/files`, { credentials: "include" });
      const data = await response.json();
      setSelectedManifest(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function removeFileFromManifest(projectId: string, hash: string) {
    if (!window.confirm("Remover este ficheiro do projeto? (O ficheiro físico permanece se usado por outros projetos)")) return;
    try {
      const response = await fetch(`/api/admin/project/${projectId}/files/${hash}`, { method: "DELETE", credentials: "include" });
      if (response.ok) {
        loadManifestFiles(projectId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="admin-storage">
      <div className="admin-storage__sidebar">
        <div className="admin-storage__header">
          <span className="eyebrow">MANIFESTOS</span>
          <h3>{manifests.length} PROJETOS</h3>
          <button className="admin-button" onClick={loadManifests} disabled={loading}><RefreshCw size={14} /> ATUALIZAR</button>
        </div>
        <div className="admin-storage__list">
          {loading ? <span className="admin-loading">A carregar...</span> : manifests.map(m => (
            <button
              key={m.projectId}
              className={`admin-storage__item ${selectedManifest?.projectId === m.projectId ? "is-selected" : ""}`}
              onClick={() => loadManifestFiles(m.projectId)}
            >
              <span className="admin-storage__name">{m.projectId}</span>
              <span className="admin-storage__meta">{m.fileCount} ficheiros · {formatBytes(m.fileCount * 500000)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="admin-storage__detail">
        {selectedManifest ? (
          <div>
            <div className="admin-storage__detail-head">
              <div>
                <span className="eyebrow">FICHEIROS DO PROJETO</span>
                <h3>{selectedManifest.projectId}</h3>
              </div>
              <span>{selectedManifest.files.length} itens</span>
            </div>
            <div className="admin-storage__files">
              {selectedManifest.files.length === 0 ? (
                <div className="admin-empty"><Database size={28} /><p>Este projeto não tem ficheiros associados.</p></div>
              ) : (
                selectedManifest.files.map(f => (
                  <div key={f.hash} className="admin-storage__file-row">
                    <div className="admin-storage__file-info">
                      <FileText size={16} />
                      <div>
                        <strong>{f.originalName}</strong>
                        <small>{f.canonicalName}</small>
                      </div>
                    </div>
                    <div className="admin-storage__file-meta">
                      <span>{formatBytes(f.size)}</span>
                      <span>{new Date(f.addedAt).toLocaleDateString("pt-PT")}</span>
                      <button className="admin-icon-button" onClick={() => removeFileFromManifest(selectedManifest.projectId, f.hash)} aria-label="Remover do projeto"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="admin-empty"><Database size={28} /><p>Selecione um manifesto na lista para ver os ficheiros.</p></div>
        )}
      </div>
    </div>
  );
}

type Frame = { id: string; mediaType: "image" | "video" | "text"; src: string; caption: string; body: string; layout: string; sortOrder: number };
type Project = { id: string; index: string; label: string; title: string; tag: string; description: string; role: string; location: string; year: string; duration?: number; video: string; coverImage?: string; template: string; frames: Frame[]; pageURL?: string; featured: boolean; published: boolean; sortOrder: number };
type PortfolioItem = { label: string; items: string };
type Homepage = { backgroundVideo: string; liveFrameBackgroundVideo: string; aboutImage: string; featuredProjectId: string; reelProjectIds: string[]; flowProjectIds: string[]; reelVideoUrls: string[]; flowVideoUrls: string[]; slideKicker: string; slideItems: string[]; aboutEyebrow: string; aboutStamp: string; aboutHeadline: string; aboutBody: string; aboutSmall: string; aboutSignature: string; aboutPortfolio: PortfolioItem[]; aboutFooterLeft: string; aboutFooterHeadline: string; aboutFooterRight: string };
type Content = { projects: Project[]; homepage: Homepage };
type Section = "overview" | "projects" | "carousels" | "homepage" | "about" | "storage";

const emptyProject = (): Project => ({ id: `project-${Date.now()}`, index: "07", label: "NOVO TRABALHO", title: "Nova imagem em movimento", tag: "IMAGEM / MOVIMENTO", description: "Um novo fragmento em movimento.", role: "DIRECÇÃO VISUAL", location: "LUANDA / MUNDO", year: "2026", duration: 10, video: "", coverImage: "", template: "cinematic", frames: [], pageURL: "", featured: false, published: false, sortOrder: 99 });
const emptyFrame = (index: number): Frame => ({ id: `frame-${Date.now()}-${index}`, mediaType: "image", src: "", caption: "", body: "", layout: "wide", sortOrder: index });
function portfolioToText(items: PortfolioItem[]) { return items.map(item => `${item.label} :: ${item.items}`).join("\n"); }
function textToPortfolio(value: string): PortfolioItem[] { return value.split("\n").map(line => line.trim()).filter(Boolean).map(line => { const [label, ...rest] = line.split("::"); return { label: label.trim(), items: rest.join("::").trim() }; }).filter(item => item.label && item.items); }

export default function Admin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<Content | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedProject = useMemo(() => content?.projects.find(project => project.id === selectedId) ?? null, [content, selectedId]);

  async function loadContent() { const response = await fetch("/api/admin/content", { credentials: "include" }); if (response.status === 401) { setAuthenticated(false); return; } if (!response.ok) throw new Error("Não foi possível carregar o conteúdo."); setContent(await response.json()); setAuthenticated(true); }
  useEffect(() => { fetch("/api/admin/session", { credentials: "include" }).then(response => response.json()).then(data => data.authenticated ? loadContent().catch(() => setAuthenticated(false)) : setAuthenticated(false)).catch(() => setAuthenticated(false)); }, []);
  async function login(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ password }) }); setBusy(false); if (!response.ok) { setMessage("Palavra-passe incorreta."); return; } setPassword(""); await loadContent(); }
  async function logout() { await fetch("/api/admin/logout", { method: "POST", credentials: "include" }); setAuthenticated(false); setContent(null); }
  async function uploadFile(file: File, kind: "video" | "image", onUploaded: (url: string) => void, projectId?: string) { setBusy(true); setMessage(`A carregar ${file.name}...`); const endpoint = projectId ? `/api/admin/project/${projectId}/upload` : "/api/admin/upload"; const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream" }, credentials: "include", body: file }); const data = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) { setMessage(data.error ?? "Não foi possível carregar o ficheiro."); return; } onUploaded(data.url); setMessage("Ficheiro carregado. Guarda agora as alterações."); }
  const fileButton = (accept: string, kind: "video" | "image", onUploaded: (url: string) => void, label: string, projectId?: string) => <label className="admin-upload-button"><Upload size={14} /> {label}<input type="file" accept={accept} onChange={event => { const file = event.target.files?.[0]; if (file) void uploadFile(file, kind, onUploaded, projectId); event.currentTarget.value = ""; }} /></label>;
  const updateProject = (patch: Partial<Project>) => setContent(current => current && selectedId ? { ...current, projects: current.projects.map(project => project.id === selectedId ? { ...project, ...patch } : project) } : current);
  const updateHomepage = (patch: Partial<Homepage>) => setContent(current => current ? { ...current, homepage: { ...current.homepage, ...patch } } : current);
  const addProject = () => { const project = emptyProject(); setContent(current => current ? { ...current, projects: [...current.projects, project] } : current); setSelectedId(project.id); setSection("projects"); };
  const updateFrame = (frameId: string, patch: Partial<Frame>) => updateProject({ frames: (selectedProject?.frames ?? []).map(frame => frame.id === frameId ? { ...frame, ...patch } : frame) });
  const addFrame = () => updateProject({ frames: [...(selectedProject?.frames ?? []), emptyFrame(selectedProject?.frames.length ?? 0)] });
  const removeFrame = (frameId: string) => updateProject({ frames: (selectedProject?.frames ?? []).filter(frame => frame.id !== frameId) });
  const moveFrame = (index: number, direction: -1 | 1) => { if (!selectedProject) return; const frames = [...selectedProject.frames]; const target = index + direction; if (target < 0 || target >= frames.length) return; [frames[index], frames[target]] = [frames[target], frames[index]]; updateProject({ frames: frames.map((frame, order) => ({ ...frame, sortOrder: order })) }); };
  const duplicateFrame = (frame: Frame) => updateProject({ frames: [...(selectedProject?.frames ?? []), { ...frame, id: `frame-${Date.now()}`, sortOrder: selectedProject?.frames.length ?? 0 }] });
  async function saveProject() { if (!selectedProject) return; setBusy(true); setMessage(""); const response = await fetch(`/api/admin/projects/${encodeURIComponent(selectedProject.id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(selectedProject) }); setBusy(false); if (!response.ok) { setMessage("Não foi possível guardar o trabalho."); return; } setMessage("Trabalho, quadros e template guardados."); await loadContent(); }
  async function deleteSelected() { if (!selectedProject || !window.confirm(`Remover “${selectedProject.title}”?`)) return; setBusy(true); await fetch(`/api/admin/projects/${encodeURIComponent(selectedProject.id)}`, { method: "DELETE", credentials: "include" }); setBusy(false); setSelectedId(null); setMessage("Trabalho removido."); await loadContent(); }
  async function saveHomepage(event: FormEvent) { event.preventDefault(); if (!content) return; setBusy(true); setMessage(""); const response = await fetch("/api/admin/homepage", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(content.homepage) }); setBusy(false); if (!response.ok) { setMessage("Não foi possível guardar a homepage."); return; } setMessage("Homepage guardada."); await loadContent(); }

  async function migrateStorage() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/storage/migrate", { method: "POST", credentials: "include" });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Erro na migração."); return; }
    setMessage(data.message ?? "Migração concluída.");
  }

  async function cleanupStorage() {
    if (!window.confirm("Mover ficheiros órfãos (não referenciados em nenhum manifesto) para _duplicados?")) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/storage/cleanup", { method: "POST", credentials: "include" });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Erro na limpeza."); return; }
    setMessage(data.message ?? "Limpeza concluída.");
  }

  async function syncManifests() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/storage/sync", { method: "POST", credentials: "include" });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Erro na sincronização."); return; }
    setMessage(data.message ?? "Sincronização concluída.");
  }

  if (authenticated === null) return <div className="admin-loading">A CARREGAR ADMIN / KU</div>;
  if (!authenticated) return <main className="admin-login"><div className="admin-login__mark">KU</div><span className="eyebrow">KAVITA UCHILA / ÁREA PRIVADA</span><h1>ENTRAR<br /><em>ADMIN</em></h1><form onSubmit={login}><label htmlFor="admin-password">PALAVRA-PASSE</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" required /><button type="submit" disabled={busy}>{busy ? "A VERIFICAR..." : "ABRIR PAINEL"}<ArrowLeft size={15} /></button>{message && <p className="admin-error">{message}</p>}</form><Link href="/" className="admin-login__back">← VOLTAR AO SITE</Link></main>;
  if (!content) return <div className="admin-loading">A PREPARAR O PAINEL</div>;
  const pageTitle = section === "overview" ? "Sala de controlo" : section === "projects" ? "Trabalhos" : section === "carousels" ? "Carrosséis" : section === "homepage" ? "Homepage" : section === "storage" ? "Armazenamento" : "Sobre";
  const renderCarouselSlots = (type: "reel" | "flow") => { const urls = type === "reel" ? content.homepage.reelVideoUrls : content.homepage.flowVideoUrls; const label = type === "reel" ? "CARROSSEL HORIZONTAL" : "FLUXO VERTICAL"; return <div className="admin-carousel-block"><div className="admin-section-head"><div><span className="eyebrow">{label}</span><h2>{type === "reel" ? "Três vídeos em faixa" : "Três vídeos em descida"}</h2></div></div><div className="admin-carousel-grid">{[0, 1, 2].map(index => <div className="admin-carousel-slot" key={`${type}-${index}`}><span className="admin-carousel-slot__index">0{index + 1}</span><div className="admin-carousel-slot__preview">{urls[index] ? <video src={urls[index]} muted loop autoPlay playsInline /> : <span>SEM VÍDEO</span>}</div><label>LINK DO VÍDEO<input value={urls[index] ?? ""} onChange={event => { const next = [...urls]; next[index] = event.target.value; updateHomepage(type === "reel" ? { reelVideoUrls: next } : { flowVideoUrls: next }); }} placeholder="https://...mp4" /></label>{fileButton("video/*", "video", url => { const next = [...urls]; next[index] = url; updateHomepage(type === "reel" ? { reelVideoUrls: next } : { flowVideoUrls: next }); }, "CARREGAR DO PC")}</div>)}</div></div>; };

  return <main className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="admin-brand">KAVITA<br /><strong>UCHILA</strong></Link><span className="admin-sidebar__label">PAINEL DE CONTROLO</span><nav><button className={section === "overview" ? "is-active" : ""} onClick={() => setSection("overview")}><LayoutDashboard size={16} /> VISÃO GERAL</button><button className={section === "projects" ? "is-active" : ""} onClick={() => setSection("projects")}><Film size={16} /> TRABALHOS <b>{content.projects.length}</b></button><button className={section === "carousels" ? "is-active" : ""} onClick={() => setSection("carousels")}><Settings2 size={16} /> CARROSSÉIS</button><button className={section === "homepage" ? "is-active" : ""} onClick={() => setSection("homepage")}><Settings2 size={16} /> HOMEPAGE</button><button className={section === "about" ? "is-active" : ""} onClick={() => setSection("about")}><UserRound size={16} /> SOBRE</button><button className={section === "storage" ? "is-active" : ""} onClick={() => setSection("storage")}><Settings2 size={16} /> ARMAZENAMENTO</button></nav><button className="admin-logout" onClick={logout}><LogOut size={15} /> SAIR</button></aside><section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">KAVITA UCHILA / ADMIN</span><h1>{pageTitle}</h1></div><span className="admin-live"><i /> CONTEÚDO AO VIVO</span></header>{message && <div className="admin-toast"><Check size={15} /> {message}</div>}

    {section === "overview" && <div className="admin-overview"><div className="admin-stat"><span>TRABALHOS</span><strong>{content.projects.length}</strong><small>{content.projects.filter(project => project.published).length} PUBLICADOS</small></div><div className="admin-stat"><span>DESTAQUE</span><strong>{content.projects.filter(project => project.featured).length}</strong><small>AO VIVO NA HOME</small></div><div className="admin-stat"><span>CARROSSÉIS</span><strong>06</strong><small>VÍDEOS EDITÁVEIS</small></div><div className="admin-quick"><span className="eyebrow">ACÇÃO RÁPIDA</span><h2>Cria o próximo frame.</h2><button className="admin-button admin-button--lime" onClick={addProject}><Plus size={16} /> CRIAR TRABALHO</button></div></div>}

    {section === "carousels" && <form className="admin-homepage" onSubmit={saveHomepage}><div className="admin-section-head"><div><span className="eyebrow">HOMEPAGE / VÍDEOS</span><h2>Substituir carrosséis</h2></div><button className="admin-button admin-button--lime" type="submit" disabled={busy}><Save size={16} /> GUARDAR CARROSSÉIS</button></div>{renderCarouselSlots("reel")}{renderCarouselSlots("flow")}</form>}

    {section === "projects" && <div className="admin-projects"><div className="admin-project-list"><div className="admin-section-head"><div><span className="eyebrow">BIBLIOTECA / IMAGEM EM MOVIMENTO</span><h2>Todos os trabalhos</h2></div><button className="admin-button admin-button--lime" onClick={addProject}><Plus size={16} /> NOVO TRABALHO</button></div>{content.projects.map(project => <button className={`admin-project-row ${project.id === selectedId ? "is-selected" : ""}`} key={project.id} onClick={() => setSelectedId(project.id)}><span>{project.index}</span><strong>{project.title}</strong><small>{project.label} · {project.frames.length} QUADROS</small><i className={project.published ? "is-published" : ""} />{project.featured && <em>DESTAQUE</em>}</button>)}</div><div className="admin-editor">{selectedProject ? <><div className="admin-editor__head"><div><span className="eyebrow">EDITAR / {selectedProject.index}</span><h2>{selectedProject.title}</h2></div><button className="admin-icon-button" onClick={deleteSelected} aria-label="Remover trabalho"><Trash2 size={16} /></button></div><div className="admin-form-grid"><label>ID DO TRABALHO<input value={selectedProject.id} readOnly /></label><label>ÍNDICE<input value={selectedProject.index} onChange={event => updateProject({ index: event.target.value })} /></label><label>TÍTULO<input value={selectedProject.title} onChange={event => updateProject({ title: event.target.value })} /></label><label>ETIQUETA<input value={selectedProject.label} onChange={event => updateProject({ label: event.target.value.toUpperCase() })} /></label><label>TAGS<input value={selectedProject.tag} onChange={event => updateProject({ tag: event.target.value })} /></label><label>ANO<input value={selectedProject.year} onChange={event => updateProject({ year: event.target.value })} /></label><label className="admin-form-grid__wide">TEMPLATE VISUAL<select value={selectedProject.template} onChange={event => updateProject({ template: event.target.value })}><option value="cinematic">Cinemático</option><option value="editorial">Editorial</option><option value="gallery">Galeria</option><option value="split">Ecrã dividido</option></select></label><label className="admin-form-grid__wide">VÍDEO PRINCIPAL<input value={selectedProject.video} onChange={event => updateProject({ video: event.target.value })} placeholder="https://...mp4" />{fileButton("video/*", "video", url => updateProject({ video: url }), "CARREGAR VÍDEO", selectedProject?.id)}</label><label className="admin-form-grid__wide">IMAGEM DE CAPA<input value={selectedProject.coverImage ?? ""} onChange={event => updateProject({ coverImage: event.target.value })} placeholder="https://...jpg" />{fileButton("image/*", "image", url => updateProject({ coverImage: url }), "CARREGAR IMAGEM", selectedProject?.id)}</label><label className="admin-form-grid__wide">DESCRIÇÃO<textarea rows={4} value={selectedProject.description} onChange={event => updateProject({ description: event.target.value })} /></label><label>FUNÇÃO / CRÉDITOS<input value={selectedProject.role} onChange={event => updateProject({ role: event.target.value })} /></label><label>LOCALIZAÇÃO<input value={selectedProject.location} onChange={event => updateProject({ location: event.target.value })} /></label><label>LINK DE ORIGEM<input value={selectedProject.pageURL ?? ""} onChange={event => updateProject({ pageURL: event.target.value })} /></label><label>ORDEM<input type="number" value={selectedProject.sortOrder} onChange={event => updateProject({ sortOrder: Number(event.target.value) })} /></label></div><div className="admin-checks"><label><input type="checkbox" checked={selectedProject.published} onChange={event => updateProject({ published: event.target.checked })} /> PUBLICADO</label><label><input type="checkbox" checked={selectedProject.featured} onChange={event => updateProject({ featured: event.target.checked })} /> DESTAQUE NA HOME</label></div><div className="admin-frames"><div className="admin-section-head"><div><span className="eyebrow">NARRATIVA / QUADROS</span><h2>{selectedProject.frames.length} quadros</h2></div><button type="button" className="admin-button admin-button--lime" onClick={addFrame}><Plus size={16} /> ADICIONAR QUADRO</button></div>{selectedProject.frames.map((frame, index) => <div className="admin-frame-card" key={frame.id}><div className="admin-frame-card__top"><strong>QUADRO {String(index + 1).padStart(2, "0")}</strong><span className="admin-frame-card__actions"><button type="button" onClick={() => moveFrame(index, -1)} aria-label="Mover para cima"><ArrowUp size={14} /></button><button type="button" onClick={() => moveFrame(index, 1)} aria-label="Mover para baixo"><ArrowDown size={14} /></button><button type="button" onClick={() => duplicateFrame(frame)} aria-label="Duplicar quadro"><Copy size={14} /></button><button type="button" onClick={() => removeFrame(frame.id)} aria-label="Remover quadro"><X size={14} /></button></span></div><div className="admin-frame-card__grid"><label>TIPO<select value={frame.mediaType} onChange={event => updateFrame(frame.id, { mediaType: event.target.value as Frame["mediaType"] })}><option value="image">Imagem</option><option value="video">Vídeo</option><option value="text">Texto</option></select></label><label>FORMATO<select value={frame.layout} onChange={event => updateFrame(frame.id, { layout: event.target.value })}><option value="wide">Largo</option><option value="portrait">Vertical</option><option value="square">Quadrado</option><option value="fullscreen">Ecrã inteiro</option><option value="split">Meia largura</option></select></label><label className="admin-form-grid__wide">LINK DO QUADRO<input value={frame.src} onChange={event => updateFrame(frame.id, { src: event.target.value })} placeholder={frame.mediaType === "video" ? "https://...mp4" : "https://...jpg"} />{frame.mediaType !== "text" && fileButton(frame.mediaType === "video" ? "video/*" : "image/*", frame.mediaType === "video" ? "video" : "image", url => updateFrame(frame.id, { src: url }), "CARREGAR DO PC", selectedProject?.id)}</label><label>LEGENDA<input value={frame.caption} onChange={event => updateFrame(frame.id, { caption: event.target.value })} /></label><label className="admin-form-grid__wide">TEXTO DO QUADRO<textarea rows={2} value={frame.body} onChange={event => updateFrame(frame.id, { body: event.target.value })} /></label></div></div>)}</div><button className="admin-button admin-button--lime admin-save" onClick={saveProject} disabled={busy}><Save size={16} /> {busy ? "A GUARDAR..." : "GUARDAR TRABALHO"}</button></> : <div className="admin-empty"><Film size={28} /><p>Selecciona um trabalho para editar ou cria um novo.</p></div>}</div></div>}

    {section === "homepage" && <form className="admin-homepage" onSubmit={saveHomepage}><div className="admin-section-head"><div><span className="eyebrow">LIVE FRAME / DEFINIÇÕES</span><h2>Controlo da homepage</h2></div><button className="admin-button admin-button--lime" type="submit" disabled={busy}><Save size={16} /> GUARDAR HOMEPAGE</button></div><div className="admin-homepage__grid"><label className="admin-form-grid__wide">VÍDEO DE FUNDO<input value={content.homepage.backgroundVideo} onChange={event => updateHomepage({ backgroundVideo: event.target.value })} placeholder="https://...mp4" />{fileButton("video/*", "video", url => updateHomepage({ backgroundVideo: url }), "CARREGAR VÍDEO", "homepage-carousels")}</label><label className="admin-form-grid__wide admin-live-frame-editor"><span className="admin-field-heading">FUNDO DO FRAME AO VIVO</span><div className="admin-live-frame-preview">{content.homepage.liveFrameBackgroundVideo ? <video src={content.homepage.liveFrameBackgroundVideo} muted loop autoPlay playsInline /> : <span>SEM VÍDEO DE FUNDO</span>}</div><input value={content.homepage.liveFrameBackgroundVideo} onChange={event => updateHomepage({ liveFrameBackgroundVideo: event.target.value })} placeholder="https://...mp4" />{fileButton("video/*", "video", url => updateHomepage({ liveFrameBackgroundVideo: url }), "CARREGAR FUNDO DO COMPUTADOR", "homepage-carousels")}</label><label>FRAME EM DESTAQUE<select value={content.homepage.featuredProjectId} onChange={event => updateHomepage({ featuredProjectId: event.target.value })}>{content.projects.map(project => <option key={project.id} value={project.id}>{project.index} / {project.title}</option>)}</select></label><label>IDS DO CARROSSEL<small>IDs separados por vírgula</small><input value={content.homepage.reelProjectIds.join(", ")} onChange={event => updateHomepage({ reelProjectIds: event.target.value.split(",").map(item => item.trim()).filter(Boolean) })} /></label><label>IDS DO FLUXO<small>IDs separados por vírgula</small><input value={content.homepage.flowProjectIds.join(", ")} onChange={event => updateHomepage({ flowProjectIds: event.target.value.split(",").map(item => item.trim()).filter(Boolean) })} /></label></div><div className="admin-slide-editor"><span className="eyebrow">SLIDE DE TEXTO</span><label>CHAMADA DO SLIDE<input value={content.homepage.slideKicker} onChange={event => updateHomepage({ slideKicker: event.target.value })} /></label><label>ITENS DO SLIDE<small>Um item por linha</small><textarea rows={10} value={content.homepage.slideItems.join("\n")} onChange={event => updateHomepage({ slideItems: event.target.value.split("\n").map(item => item.trim()).filter(Boolean) })} /></label></div></form>}

    {section === "about" && <form className="admin-homepage" onSubmit={saveHomepage}><div className="admin-section-head"><div><span className="eyebrow">SOBRE / PERFIL E PORTFÓLIO</span><h2>Editar Sobre</h2></div><button className="admin-button admin-button--lime" type="submit" disabled={busy}><Save size={16} /> GUARDAR SOBRE</button></div><div className="admin-homepage__grid"><label>LINHA DE SECÇÃO<input value={content.homepage.aboutEyebrow} onChange={event => updateHomepage({ aboutEyebrow: event.target.value })} /></label><label>SELO<input value={content.homepage.aboutStamp} onChange={event => updateHomepage({ aboutStamp: event.target.value })} /></label><label className="admin-form-grid__wide">IMAGEM DO SOBRE<input value={content.homepage.aboutImage} onChange={event => updateHomepage({ aboutImage: event.target.value })} placeholder="https://...jpg" />{fileButton("image/*", "image", url => updateHomepage({ aboutImage: url }), "CARREGAR IMAGEM", "homepage-carousels")}</label><label className="admin-form-grid__wide">TÍTULO PRINCIPAL<textarea rows={3} value={content.homepage.aboutHeadline} onChange={event => updateHomepage({ aboutHeadline: event.target.value })} /></label><label className="admin-form-grid__wide">TEXTO BIOGRÁFICO<textarea rows={6} value={content.homepage.aboutBody} onChange={event => updateHomepage({ aboutBody: event.target.value })} /></label><label>ASSINATURA / FUNÇÃO<textarea rows={3} value={content.homepage.aboutSignature} onChange={event => updateHomepage({ aboutSignature: event.target.value })} /></label><label>TEXTO CURTO<input value={content.homepage.aboutSmall} onChange={event => updateHomepage({ aboutSmall: event.target.value })} /></label><label className="admin-form-grid__wide">CATEGORIAS DO PORTFÓLIO<small>Uma por linha: CATEGORIA :: trabalhos</small><textarea rows={8} value={portfolioToText(content.homepage.aboutPortfolio)} onChange={event => updateHomepage({ aboutPortfolio: textToPortfolio(event.target.value) })} /></label><label>RODAPÉ / ESQUERDA<input value={content.homepage.aboutFooterLeft} onChange={event => updateHomepage({ aboutFooterLeft: event.target.value })} /></label><label>RODAPÉ / FRASE<input value={content.homepage.aboutFooterHeadline} onChange={event => updateHomepage({ aboutFooterHeadline: event.target.value })} /></label><label>RODAPÉ / DIREITA<input value={content.homepage.aboutFooterRight} onChange={event => updateHomepage({ aboutFooterRight: event.target.value })} /></label></div></form>}

    {section === "storage" && <div className="admin-homepage"><div className="admin-section-head"><div><span className="eyebrow">ARMAZENAMENTO / MANIFESTOS</span><h2>Gestão de ficheiros por projeto</h2></div></div><div className="admin-homepage__grid"><label className="admin-form-grid__wide"><button className="admin-button admin-button--lime" onClick={migrateStorage} disabled={busy}><Save size={16} /> MIGRAR ESTRUTURA ANTIGA</button><small>Cria manifestos para projetos existentes baseados nas URLs atuais</small></label><label className="admin-form-grid__wide"><button className="admin-button" onClick={cleanupStorage} disabled={busy}><Trash2 size={16} /> LIMPAR ÓRFÃOS</button><small>Move ficheiros não referenciados por nenhum manifesto para _duplicados</small></label><label className="admin-form-grid__wide"><button className="admin-button" onClick={syncManifests} disabled={busy}><Copy size={16} /> SINCRONIZAR MANIFESTOS</button><small>Remove referências a ficheiros que já não existem no disco</small></label></div><StorageManifests /></div>}

  </section></main>;
}
