import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Menu, MoveUpRight, X } from "lucide-react";
import { useLocation } from "wouter";

type VideoItem = {
  id: string;
  label: string;
  title: string;
  tag: string;
  duration?: number;
  video: string;
  coverImage?: string;
  pageURL?: string;
};

type ReelPhase = "hidden" | "entering" | "visible" | "leaving";

type HomepageConfig = {
  backgroundVideo: string;
  liveFrameBackgroundVideo: string;
  aboutImage: string;
  featuredProjectId: string;
  reelProjectIds: string[];
  flowProjectIds: string[];
  reelVideoUrls: string[];
  flowVideoUrls: string[];
  slideKicker: string;
  slideItems: string[];
  aboutEyebrow: string;
  aboutStamp: string;
  aboutHeadline: string;
  aboutBody: string;
  aboutSmall: string;
  aboutSignature: string;
  aboutPortfolio: Array<{ label: string; items: string }>;
  aboutFooterLeft: string;
  aboutFooterHeadline: string;
  aboutFooterRight: string;
};

const FALLBACK_HOMEPAGE: HomepageConfig = {
  backgroundVideo: "https://cdn.pixabay.com/video/2025/11/24/317899_medium.mp4",
  liveFrameBackgroundVideo: "https://cdn.pixabay.com/video/2025/11/24/317899_medium.mp4",
  aboutImage: "",
  featuredProjectId: "portrait-316579",
  reelProjectIds: ["piano-40390", "portrait-316579", "dance-75547"],
  flowProjectIds: ["fashion-362758", "dj-13071", "studio-33517"],
  reelVideoUrls: [],
  flowVideoUrls: [],
  slideKicker: "OS NOSSOS CRIADORES",
  slideItems: ["KAVITA UCHILA", "GERSÓN GEREMIAS", "IMAGEM COM PULSO", "FREQUÊNCIA NEGRA", "ESTUDOS DE MOVIMENTO", "CULTURA DA LUZ", "SINAL NOTURNO", "FORMA HUMANA", "LUANDA / MUNDO", "UNIDADE EDITORIAL", "DO SOM À IMAGEM", "HISTÓRIAS VISUAIS"],
  aboutEyebrow: "SOBRE / GERSON GEREMIAS UCHILA",
  aboutStamp: "TAMBÉM KAVITA UCHILA",
  aboutHeadline: "Duas forças movem cada frame: uma ideia visual com impacto e código que a faz funcionar.",
  aboutBody: "A paixão por videojogos, cinema, modelação 3D e criação de conceitos levou Gerson Geremias Uchila a construir universos visuais para marcas, música, cultura e pessoas. Hoje trabalha de forma independente, com a pequena equipa Planilha, juntando direção visual, motion, 3D, design e novas ferramentas de inteligência artificial.",
  aboutSmall: "Diretor visual independente · artista 3D · tecnólogo criativo",
  aboutSignature: "Gerson Geremias Uchila\nDiretor visual · artista 3D · tecnólogo criativo",
  aboutPortfolio: [],
  aboutFooterLeft: "PESSOAS / LUZ / RITMO",
  aboutFooterHeadline: "FAZEMOS O FRAME MOVER-SE.",
  aboutFooterRight: "LUANDA / MUNDO",
};

const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: "piano-40390",
    label: "01 / MÚSICA",
    title: "Mãos no som",
    tag: "ESTÚDIO / RITMO",
    duration: 20,
    video: "https://cdn.pixabay.com/video/2020/05/28/40390-425442522_medium.mp4",
    pageURL: "https://pixabay.com/videos/id-40390/",
  },
  {
    id: "portrait-316579",
    label: "02 / RETRATO",
    title: "Novas silhuetas",
    tag: "MODA / FORMA",
    duration: 6,
    video: "https://cdn.pixabay.com/video/2025/11/17/316579_medium.mp4",
    pageURL: "https://pixabay.com/videos/id-316579/",
  },
  {
    id: "dance-75547",
    label: "03 / MOVIMENTO",
    title: "Corpos no frame",
    tag: "PERFORMANCE / ENERGIA",
    duration: 17,
    video: "https://cdn.pixabay.com/video/2021/05/28/75547-556034400_medium.mp4",
    pageURL: "https://pixabay.com/videos/id-75547/",
  },
  {
    id: "fashion-362758",
    label: "04 / EDITORIAL",
    title: "A luz encontra a pele",
    tag: "CAMPANHA / TEXTURA",
    duration: 12,
    video: "https://cdn.pixabay.com/video/2026/07/08/362758_medium.mp4",
    pageURL: "https://pixabay.com/videos/id-362758/",
  },
  {
    id: "dj-13071",
    label: "05 / SOM",
    title: "Depois do beat",
    tag: "MÚSICA / ATITUDE",
    duration: 15,
    video: "https://cdn.pixabay.com/video/2017/11/26/13071-244835811_medium.mp4",
    pageURL: "https://pixabay.com/videos/id-13071/",
  },
  {
    id: "studio-33517",
    label: "06 / PESSOAS",
    title: "O grande plano",
    tag: "RETRATO / PRESENÇA",
    duration: 13,
    video: "https://cdn.pixabay.com/video/2020/03/11/33517-397143847_medium.mp4",
    pageURL: "https://pixabay.com/videos/id-33517/",
  },
];

const PORTFOLIO_CATEGORIES = [
  { label: "DESIGN GRÁFICO", items: "Universo Digital TV · Optims · Chimuma · Kolapo Arquitectura · Convénios Solution · Fab Pro · Moldar · FTE · Koolba" },
  { label: "AUDIOVISUAL / MOTION", items: "FTE Video Promo · Kanuca · Missão Angola · Ginástica Na Minha Banda" },
  { label: "ARTE 3D", items: "Design de interiores · Kolapo · Trabalhos pessoais · ZBrush" },
  { label: "STARTUPS", items: "Vab · Skikies · Farmy dos Criadores" },
  { label: "GALERIAS / EVENTOS", items: "Expo Recicla · FTE · Morna" },
];

function normalizeApiVideos(input: unknown): VideoItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item, index) => ({
      id: String(item.id ?? `pixabay-${index}`),
      label: `${String(item.index ?? String(index + 1).padStart(2, "0"))} / ${String(item.label ?? "STOCK").toUpperCase()}`,
      title: String(item.title ?? "Unscripted light"),
      tag: String(item.tag ?? "IMAGEM / MOVIMENTO"),
      duration: typeof item.duration === "number" ? item.duration : undefined,
      video: String(item.video ?? ""),
      coverImage: typeof item.coverImage === "string" ? item.coverImage : undefined,
      pageURL: typeof item.pageURL === "string" ? item.pageURL : undefined,
    }))
    .filter(item => item.video.startsWith("http"));
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-mark brand-mark--compact" : "brand-mark"}>
      <span className="brand-mark__face" aria-hidden="true">
        <i />
        <i />
        <b />
      </span>
      <span>KAVITA</span>
      <span>UCHILA</span>
    </span>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>(FALLBACK_VIDEOS);
  const [homepage, setHomepage] = useState<HomepageConfig>(FALLBACK_HOMEPAGE);
  const [activeVideo, setActiveVideo] = useState<string | null>(FALLBACK_VIDEOS[1].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false });
  const [reelOffset, setReelOffset] = useState(0);
  const [reelPhase, setReelPhase] = useState<ReelPhase>("hidden");
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [, setLocation] = useLocation();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-content", { headers: { Accept: "application/json" } })
      .then(response => (response.ok ? response.json() : null))
      .then(payload => {
        const next = normalizeApiVideos(payload?.videos);
        if (!cancelled && next.length >= 4) {
          setVideos(next.slice(0, 8));
          if (payload?.homepage) setHomepage(payload.homepage as HomepageConfig);
          setActiveVideo(current => payload?.homepage?.featuredProjectId && next.some(item => item.id === payload.homepage.featuredProjectId) ? payload.homepage.featuredProjectId : next.some(item => item.id === current) ? current : next[0].id);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, element]) => {
      if (!element) return;
      if (id === activeVideo) {
        element.play().catch(() => undefined);
      } else {
        element.pause();
        element.currentTime = 0;
      }
    });
  }, [activeVideo, videos]);

  useEffect(() => {
    const durations: Record<ReelPhase, number> = {
      hidden: 4600,
      entering: 1800,
      visible: 4800,
      leaving: 1500,
    };
    const timer = window.setTimeout(() => {
      if (reelPhase === "leaving") {
        setReelOffset(current => (current + 3) % Math.max(videos.length, 1));
        setReelPhase("hidden");
      } else if (reelPhase === "hidden") {
        setReelPhase("entering");
      } else if (reelPhase === "entering") {
        setReelPhase("visible");
      } else {
        setReelPhase("leaving");
      }
    }, durations[reelPhase]);
    return () => window.clearTimeout(timer);
  }, [reelPhase, videos.length]);

  useEffect(() => {
    let rafId: number;
    let pending: { x: number; y: number } | null = null;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pending = { x: event.clientX, y: event.clientY };
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (pending) {
            setCursor({ x: pending.x, y: pending.y, visible: true });
            pending = null;
          }
          rafId = 0;
        });
      }
    };
    const onPointerLeave = () => setCursor(current => ({ ...current, visible: false }));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  const featuredVideo = useMemo(() => videos.find(video => video.id === activeVideo) ?? videos.find(video => video.id === homepage.featuredProjectId) ?? videos[0], [activeVideo, homepage.featuredProjectId, videos]);
  const reelVideos = useMemo(() => {
    if (homepage.reelVideoUrls?.length >= 2) return homepage.reelVideoUrls.slice(0, 2).map((url, index) => ({ id: `reel-slot-${index}`, label: `${String(index + 1).padStart(2, "0")} / CARROSSEL`, title: "Vídeo do carrossel", tag: "IMAGEM / MOVIMENTO", video: url }));
    const configured = homepage.reelProjectIds.map(id => videos.find(video => video.id === id)).filter(Boolean) as VideoItem[];
    const source = configured.length >= 3 ? configured : videos;
    return [0, 1, 2].map(index => source[(reelOffset + index) % source.length]).filter(Boolean);
  }, [homepage.reelProjectIds, reelOffset, videos]);
  const flowVideos = useMemo(() => {
    if (homepage.flowVideoUrls?.length >= 1) return homepage.flowVideoUrls.slice(0, 1).map((url, index) => ({ id: `flow-slot-${index}`, label: `${String(index + 1).padStart(2, "0")} / FLUXO`, title: "Vídeo do fluxo", tag: "IMAGEM / MOVIMENTO", video: url }));
    const selected = homepage.flowProjectIds.map(id => videos.find(video => video.id === id)).filter(Boolean) as VideoItem[];
    const source = selected.length >= 1 ? selected : videos.slice(0, 1);
    return source;
  }, [homepage.flowProjectIds, videos]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell">
      <div className={`cursor-orbit ${cursor.visible ? "is-visible" : ""}`} style={{ left: cursor.x, top: cursor.y }}>
        <span>VER</span>
      </div>

      <div className="grain" aria-hidden="true" />
      <div className="background-scribble background-scribble--one" aria-hidden="true">K</div>
      <div className="background-scribble background-scribble--two" aria-hidden="true">U</div>

      <header className="topbar">
        <a className="topbar__brand" href="#top" aria-label="Kavita Uchila — início"><BrandMark compact /></a>
        <div className="topbar__signal">ESTÚDIO VISUAL <span /> LUANDA / MUNDO</div>
        <nav className={`topnav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <a href="#work" onClick={closeMenu}>TRABALHOS <span>01</span></a>
          <a href="#about" onClick={closeMenu}>SOBRE <span>02</span></a>
          <a href="#contact" onClick={closeMenu}>CONTACTO <span>03</span></a>
        </nav>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <section className="hero" id="top">
        <video
          className="hero__background-video"
          src={homepage.backgroundVideo}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          aria-hidden="true"
        />
        <div className="hero__background-wash" aria-hidden="true" />
        <div className="hero__meta eyebrow"><span>DESLIZA PARA MOVER</span><span>EST. 2026</span></div>
        <div className="hero__stage" aria-label="Vídeo em destaque">
          <div className="hero__stage-label"><span>FRAME AO VIVO</span><span>{featuredVideo?.label}</span></div>
          <div className="hero__video-wrap">
            <video className="hero__live-frame-background" src={homepage.liveFrameBackgroundVideo} muted loop autoPlay playsInline preload="none" aria-hidden="true" />
            {featuredVideo && <video
              className="hero__video hero__video--soft-focus"
              src={featuredVideo.video}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              ref={element => { videoRefs.current[featuredVideo.id] = element; }}
            />}
            <div className="hero__video-wash" />
            <div className="hero__copy">
              <p className="hero__kicker">KAVITA UCHILA / IMAGEM COM PULSO</p>
              <h1><span>KAVITA</span><span className="hero__title-offset">UCHILA</span></h1>
              <p className="hero__intro">Criamos mundos visuais para música, moda e pessoas que se recusam a ficar paradas.</p>
            </div>
            <div className="hero__flow" aria-label="Carrossel único de vídeos horizontais">
              <div className="hero__flow-track">
                {flowVideos.map((video, index) => (
                  <div className={`hero__flow-card hero__flow-card--${index % 3}`} key={`flow-${video.id}-${index}`}>
                    <video src={video.video} muted loop autoPlay playsInline preload="metadata" />
                    <span>{String((index % Math.max(flowVideos.length / 2, 1)) + 1).padStart(2, "0")} / {video.label.split(" / ").pop()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero__text-slide" aria-label="Manifesto e diretores Kavita Uchila">
              <span className="hero__text-slide-kicker">{homepage.slideKicker}</span>
              <div className="hero__text-slide-list">
                {homepage.slideItems.map(item => <span key={item}>{item}</span>)}
              </div>
            </div>
            <div className={`hero__reel hero__reel--${reelPhase}`} aria-label="Carrossel horizontal de três vídeos">
              {reelVideos.map((video, index) => (
                <div className="hero__reel-card" key={`reel-${reelOffset}-${video.id}`}>
                  <video src={video.video} muted loop autoPlay playsInline preload="metadata" />
                  <span>{String(index + 1).padStart(2, "0")} / {video.label.split(" / ").pop()}</span>
                </div>
              ))}
            </div>
            <div className="hero__video-caption"><span>{featuredVideo?.title}</span><span>{featuredVideo?.tag}</span></div>
          </div>
          <div className="hero__stage-index">{String(Math.max(1, videos.findIndex(item => item.id === featuredVideo?.id) + 1)).padStart(2, "0")}<i />{String(videos.length).padStart(2, "0")}</div>
        </div>
        <a className="hero__scroll" href="#work"><ArrowDownRight size={17} /> ENTRAR NOS TRABALHOS</a>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div><span className="section-number">01</span><span className="eyebrow">TRABALHOS SELECCIONADOS / IMAGEM EM MOVIMENTO</span></div>
          <p>Seis fragmentos de uma história maior.<br />Passa por um frame para o despertar.</p>
        </div>
        <div className="work-grid">
          {videos.map((video, index) => (
            <article
              className={`work-card work-card--${index + 1} ${activeVideo === video.id ? "is-active" : ""}`}
              key={video.id}
              tabIndex={0}
              onMouseEnter={() => setActiveVideo(video.id)}
              onFocus={() => setActiveVideo(video.id)}
              onClick={() => setLocation(`/projects/${video.id}`)}
              onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setLocation(`/projects/${video.id}`); } }}
              aria-label={`${video.title}, ${video.tag}. Ativar vídeo.`}
            >
              <video
                className="work-card__video"
                src={video.video}
                muted
                loop
                playsInline
                poster={video.coverImage}
                preload={activeVideo === video.id ? "auto" : "none"}
                ref={element => { videoRefs.current[video.id] = element; }}
              />
              <div className="work-card__still" aria-hidden="true"><strong>KU</strong><span>{video.label}</span></div>
              <div className="work-card__overlay" />
              <div className="work-card__top"><span>{video.label}</span><span>{String(index + 1).padStart(2, "0")}</span></div>
              <div className="work-card__bottom"><h2>{video.title}</h2><span>{video.tag}</span></div>
              <div className="work-card__play">{activeVideo === video.id ? "PAUSA" : "VER"}<MoveUpRight size={14} /></div>
            </article>
          ))}
        </div>
        <div className="work-footer"><span>FRAGMENTOS DE STOCK / PIXABAY</span><span>PASSA / TOCA PARA VER <ArrowUpRight size={14} /></span></div>
      </section>

      <section className="about-section" id="about">
        <div className="about-section__top"><span className="section-number">02</span><span className="eyebrow">{homepage.aboutEyebrow}</span><span className="about-section__stamp">{homepage.aboutStamp}</span></div>
        <div className="about-section__body">
          <div className="about-section__mark">{homepage.aboutImage && <img className="about-section__image" src={homepage.aboutImage} alt="Imagem de Gerson Geremias Uchila" />}<BrandMark /><span>CONCEITO / IMAGEM / CÓDIGO</span><span className="about-section__signature">{homepage.aboutSignature.split("\n").map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}</span></div>
          <div className="about-section__statement"><p>{homepage.aboutHeadline}</p><p className="about-section__small">{homepage.aboutBody}</p></div>
        </div>
        <div className="about-section__portfolio"><div className="about-section__portfolio-head"><span className="eyebrow">PORTFÓLIO SELECCIONADO / PRÁTICA INDEPENDENTE</span><span>TRABALHOS CONFIDENCIAIS / DISPONÍVEIS SOB PEDIDO</span></div><div className="about-section__portfolio-grid">{homepage.aboutPortfolio.map(category => <div className="about-section__portfolio-item" key={category.label}><strong>{category.label}</strong><span>{category.items}</span></div>)}</div></div>
        <div className="about-section__line"><span>{homepage.aboutFooterLeft}</span><strong>{homepage.aboutFooterHeadline}</strong><span>{homepage.aboutFooterRight}</span></div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-section__header"><span className="section-number">03</span><span className="eyebrow">CONTACTO / COMEÇAR UM SINAL</span></div>
        <div className="contact-section__main">
          <h2>VAMOS CRIAR<br /><em>ALGO</em><br />FORTE.</h2>
          <div className="contact-section__aside"><p>Tens um som, um rosto ou uma sensação que precisa de um frame?</p><a className="contact-link" href="mailto:gersongeremias3@gmail.com">gersongeremias3@gmail.com <ArrowUpRight size={17} /></a><a className="contact-link" href="tel:+244947537351">+244 947 53 73 51 <ArrowUpRight size={17} /></a></div>
        </div>
        <div className="contact-section__footer"><span>KAVITA UCHILA / LUANDA — MUNDO</span><a href="#top">VOLTAR AO TOPO <ArrowUpRight size={14} /></a></div>
      </section>

      <footer className="site-footer"><BrandMark compact /><span>© 2026 KAVITA UCHILA</span><span>IMAGEM COM PULSO.</span></footer>
    </main>
  );
}
