import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";

type ProjectVideo = {
  id: string;
  label: string;
  title: string;
  tag: string;
  video: string;
  coverImage?: string;
  pageURL?: string;
  template?: string;
  frames?: Array<{ id: string; mediaType: string; src: string; caption: string; body: string; layout: string; sortOrder: number }>;
};

const FALLBACK_PROJECTS: ProjectVideo[] = [
  { id: "piano-40390", label: "01 / MÚSICA", title: "Mãos no som", tag: "ESTÚDIO / RITMO", video: "https://cdn.pixabay.com/video/2020/05/28/40390-425442522_medium.mp4" },
  { id: "portrait-316579", label: "02 / RETRATO", title: "Novas silhuetas", tag: "MODA / FORMA", video: "https://cdn.pixabay.com/video/2025/11/17/316579_medium.mp4" },
  { id: "dance-75547", label: "03 / MOVIMENTO", title: "Corpos no frame", tag: "PERFORMANCE / ENERGIA", video: "https://cdn.pixabay.com/video/2021/05/28/75547-556034400_medium.mp4" },
  { id: "fashion-362758", label: "04 / EDITORIAL", title: "A luz encontra a pele", tag: "CAMPANHA / TEXTURA", video: "https://cdn.pixabay.com/video/2026/07/08/362758_medium.mp4" },
  { id: "dj-13071", label: "05 / SOM", title: "Depois do beat", tag: "MÚSICA / ATITUDE", video: "https://cdn.pixabay.com/video/2017/11/26/13071-244835811_medium.mp4" },
  { id: "studio-33517", label: "06 / PESSOAS", title: "O grande plano", tag: "RETRATO / PRESENÇA", video: "https://cdn.pixabay.com/video/2020/03/11/33517-397143847_medium.mp4" },
];

const PROJECT_COPY: Record<string, { description: string; role: string; location: string; year: string }> = {
  "piano-40390": { description: "Um estudo táctil de mãos, ritmo e da electricidade silenciosa de uma sala antes da primeira nota.", role: "DIRECÇÃO VISUAL / IMAGEM EM MOVIMENTO", location: "LUANDA / MUNDO", year: "2026" },
  "portrait-316579": { description: "Retratos que se movem como tecido: directos, íntimos e construídos no instante em que uma silhueta se torna presença.", role: "CAMPANHA / DIRECÇÃO DE ARTE", location: "LUANDA / MUNDO", year: "2026" },
  "dance-75547": { description: "Corpos em movimento, cortados pelo beat. Um fragmento sobre energia, libertação e a forma de um gesto.", role: "PERFORMANCE / EDITORIAL", location: "LUANDA / MUNDO", year: "2026" },
  "fashion-362758": { description: "Um estudo sobre a luz a encontrar a pele, a textura e a geometria imperfeita de um frame em movimento.", role: "CRIAÇÃO DE IMAGEM / DIRECÇÃO", location: "LUANDA / MUNDO", year: "2026" },
  "dj-13071": { description: "Depois do beat, a imagem continua a mover-se. O som torna-se postura, cor e uma sala cheia de sinal.", role: "MÚSICA / SISTEMA VISUAL", location: "LUANDA / MUNDO", year: "2026" },
  "studio-33517": { description: "Um grande plano nunca está parado. Um retrato de atenção, proximidade e dos detalhes que ficam connosco.", role: "RETRATO / IMAGEM EM MOVIMENTO", location: "LUANDA / MUNDO", year: "2026" },
};

function normalizeProjects(input: unknown): ProjectVideo[] {
  if (!Array.isArray(input)) return [];
  return input.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map((item, index) => ({
    id: String(item.id ?? `pixabay-${index}`),
    label: `${String(item.index ?? String(index + 1).padStart(2, "0"))} / ${String(item.label ?? "STOCK").toUpperCase()}`,
    title: String(item.title ?? "Luz sem guião"),
    tag: String(item.tag ?? "IMAGEM / MOVIMENTO"),
    video: String(item.video ?? ""),
    coverImage: typeof item.coverImage === "string" ? item.coverImage : undefined,
    template: typeof item.template === "string" ? item.template : "cinematic",
    frames: Array.isArray(item.frames) ? item.frames as ProjectVideo["frames"] : [],
    pageURL: typeof item.pageURL === "string" ? item.pageURL : undefined,
  })).filter(item => item.video.startsWith("http"));
}

export default function Project() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<ProjectVideo[]>(FALLBACK_PROJECTS);
  const projectId = params?.id ?? FALLBACK_PROJECTS[0].id;

  useEffect(() => {
    fetch("/api/site-content", { headers: { Accept: "application/json" } })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        const next = normalizeProjects(payload?.videos);
        if (next.length >= 1) setProjects(next);
      })
      .catch(() => undefined);
  }, []);

  const project = useMemo(() => projects.find(item => item.id === projectId) ?? projects[0], [projectId, projects]);
  const index = Math.max(0, projects.findIndex(item => item.id === project.id));
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const copy = PROJECT_COPY[project.id] ?? { description: "Um fragmento de imagem em movimento com um pulso próprio.", role: "IMAGEM EM MOVIMENTO / DIRECÇÃO DE ARTE", location: "LUANDA / MUNDO", year: "2026" };

  if (!project) return null;

  return (
    <main className="project-page">
      <header className="project-nav">
        <Link href="/" className="project-nav__brand" aria-label="Voltar à homepage">KAVITA UCHILA</Link>
        <span className="project-nav__crumb">TRABALHO / {project.label}</span>
        <Link href="/#work" className="project-nav__back"><ArrowLeft size={14} /> TODOS OS TRABALHOS</Link>
      </header>

      <section className="project-hero">
        <video className="project-hero__video" src={project.video} poster={project.coverImage} muted loop autoPlay playsInline preload="metadata" />
        <div className="project-hero__wash" />
        <div className="project-hero__index">{project.label}<i />{String(projects.length).padStart(2, "0")}</div>
        <div className="project-hero__title">
          <span className="eyebrow">KAVITA UCHILA / {copy.role}</span>
          <h1>{project.title}</h1>
          <span className="project-hero__tag">{project.tag}</span>
        </div>
        <button className="project-hero__sound" type="button" onClick={() => setLocation("/#contact")}>COMEÇAR UM SINAL <ArrowUpRight size={15} /></button>
      </section>

      <section className="project-info">
        <div className="project-info__label"><span className="section-number">01</span><span className="eyebrow">NOTA DO TRABALHO</span></div>
        <p className="project-info__description">{copy.description}</p>
        <dl className="project-info__details">
          <div><dt>FUNÇÃO</dt><dd>{copy.role}</dd></div>
          <div><dt>LOCALIZAÇÃO</dt><dd>{copy.location}</dd></div>
          <div><dt>ANO</dt><dd>{copy.year}</dd></div>
        </dl>
      </section>

      {project.frames && project.frames.length > 0 && <section className={`project-frames project-frames--${project.template ?? "cinematic"}`} aria-label="Quadros do trabalho">
        {project.frames.map(frame => <article className={`project-frame project-frame--${frame.layout}`} key={frame.id}>
          <div className={`project-frame__media ${frame.mediaType === "text" ? "project-frame__media--text" : ""}`}>{frame.mediaType === "text" ? <p>{frame.body}</p> : frame.mediaType === "video" ? <video src={frame.src} muted loop autoPlay playsInline preload="metadata" /> : <img src={frame.src} alt={frame.caption || project.title} />}</div>
          {(frame.caption || frame.body) && <div className="project-frame__copy">{frame.caption && <strong>{frame.caption}</strong>}{frame.body && <p>{frame.body}</p>}</div>}
        </article>)}
      </section>}

      <section className="project-strip" aria-label="Mais trabalhos">
        <div className="project-strip__head"><span className="eyebrow">MAIS IMAGEM EM MOVIMENTO</span><span>{String(projects.length).padStart(2, "0")} FRAGMENTOS</span></div>
        <div className="project-strip__grid">
          {projects.filter(item => item.id !== project.id).slice(0, 3).map(item => (
            <Link href={`/projects/${item.id}`} className="project-thumb" key={item.id}>
              <video src={item.video} poster={item.coverImage} muted loop autoPlay playsInline preload="metadata" />
              <span>{item.label}</span><strong>{item.title}</strong><ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      </section>

      <footer className="project-footer">
        <Link href={`/projects/${previous.id}`} className="project-footer__control"><ArrowLeft size={17} /><span>ANTERIOR<br /><strong>{previous.title}</strong></span></Link>
        <Link href="/" className="project-footer__center">KAVITA UCHILA<br /><small>IMAGEM COM PULSO</small></Link>
        <Link href={`/projects/${next.id}`} className="project-footer__control project-footer__control--next"><span>PRÓXIMO<br /><strong>{next.title}</strong></span><ArrowRight size={17} /></Link>
      </footer>
    </main>
  );
}
