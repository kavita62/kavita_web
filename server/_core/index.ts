import "dotenv/config";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getSessionCookieOptions } from "./cookies";
import { deleteProject, getContent, HomepageContent, normalizeHomepage, PublicProject, saveHomepage, saveProjectFrames, upsertProject } from "../content";

type MediaItem = {
  id: string;
  index: string;
  label: string;
  title: string;
  tag: string;
  duration?: number;
  video: string;
  pageURL?: string;
};

type PixabayHit = {
  id?: number;
  tags?: string;
  duration?: number;
  pageURL?: string;
  videos?: Record<string, { url?: string }>;
};

type PixabayResponse = { hits?: PixabayHit[] };

const fallbackMedia: MediaItem[] = [
  { id: "piano-40390", index: "01", label: "MUSIC", title: "Hands on sound", tag: "STUDIO / RHYTHM", duration: 20, video: "https://cdn.pixabay.com/video/2020/05/28/40390-425442522_medium.mp4", pageURL: "https://pixabay.com/videos/id-40390/" },
  { id: "portrait-316579", index: "02", label: "PORTRAIT", title: "New silhouettes", tag: "FASHION / FORM", duration: 6, video: "https://cdn.pixabay.com/video/2025/11/17/316579_medium.mp4", pageURL: "https://pixabay.com/videos/id-316579/" },
  { id: "dance-75547", index: "03", label: "MOTION", title: "Bodies in frame", tag: "PERFORMANCE / ENERGY", duration: 17, video: "https://cdn.pixabay.com/video/2021/05/28/75547-556034400_medium.mp4", pageURL: "https://pixabay.com/videos/id-75547/" },
  { id: "fashion-362758", index: "04", label: "EDITORIAL", title: "Light finds skin", tag: "CAMPAIGN / TEXTURE", duration: 12, video: "https://cdn.pixabay.com/video/2026/07/08/362758_medium.mp4", pageURL: "https://pixabay.com/videos/id-362758/" },
  { id: "dj-13071", index: "05", label: "SOUND", title: "After the beat", tag: "MUSIC / ATTITUDE", duration: 15, video: "https://cdn.pixabay.com/video/2017/11/26/13071-244835811_medium.mp4", pageURL: "https://pixabay.com/videos/id-13071/" },
  { id: "studio-33517", index: "06", label: "PEOPLE", title: "The close-up", tag: "PORTRAIT / PRESENCE", duration: 13, video: "https://cdn.pixabay.com/video/2020/03/11/33517-397143847_medium.mp4", pageURL: "https://pixabay.com/videos/id-33517/" },
];

const pixabaySearches = [
  { q: "black musician performance", label: "MUSIC", title: "Live frequency", tag: "SOUND / PRESENCE" },
  { q: "black fashion portrait", label: "PORTRAIT", title: "New silhouette", tag: "FASHION / FORM" },
  { q: "dance studio performance", label: "MOTION", title: "Bodies in frame", tag: "PERFORMANCE / ENERGY" },
  { q: "fashion photoshoot", label: "EDITORIAL", title: "Light finds skin", tag: "CAMPAIGN / TEXTURE" },
];

let mediaCache: { expiresAt: number; videos: MediaItem[] } | null = null;

const ADMIN_COOKIE = "kavita_admin_session";
const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createAdminToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  const signature = createHmac("sha256", adminPassword()).update(`admin:${expiresAt}`).digest("hex");
  return `${expiresAt}.${signature}`;
}

function readCookie(request: express.Request, name: string) {
  const raw = request.headers.cookie ?? "";
  const match = raw.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return match?.slice(name.length + 1) ?? "";
}

function isAdminRequest(request: express.Request) {
  const token = readCookie(request, ADMIN_COOKIE);
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000) || !adminPassword()) return false;
  const expected = createHmac("sha256", adminPassword()).update(`admin:${expiresAt}`).digest("hex");
  return safeEqual(signature, expected);
}

function adminOnly(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (!isAdminRequest(request)) {
    response.status(401).json({ error: "Admin authentication required" });
    return;
  }
  next();
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeProjectPayload(id: string, value: unknown): PublicProject {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    id,
    index: stringValue(raw.index, "00"),
    label: stringValue(raw.label, "NEW WORK").toUpperCase(),
    title: stringValue(raw.title, "Untitled moving image"),
    tag: stringValue(raw.tag, "IMAGE / MOVEMENT"),
    description: stringValue(raw.description, "A new fragment in motion."),
    role: stringValue(raw.role, "VISUAL DIRECTION"),
    location: stringValue(raw.location, "LUANDA / WORLDWIDE"),
    year: stringValue(raw.year, "2026"),
    duration: numberValue(raw.duration, 10),
    video: stringValue(raw.video),
    coverImage: stringValue(raw.coverImage),
    template: stringValue(raw.template, "cinematic"),
    frames: Array.isArray(raw.frames) ? raw.frames.filter(item => item && typeof item === "object").map((item, index) => { const frame = item as Record<string, unknown>; return { id: stringValue(frame.id, `${id}-frame-${index + 1}`), mediaType: stringValue(frame.mediaType, "image"), src: stringValue(frame.src), caption: stringValue(frame.caption), body: stringValue(frame.body), layout: stringValue(frame.layout, "wide"), sortOrder: numberValue(frame.sortOrder, index) }; }).filter(frame => frame.src || frame.body) : [],
    pageURL: stringValue(raw.pageURL),
    featured: raw.featured === true,
    published: raw.published === true,
    sortOrder: numberValue(raw.sortOrder, 99),
  };
}

function normalizeHomepagePayload(value: unknown): HomepageContent {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const list = (input: unknown) => Array.isArray(input) ? input.filter(item => typeof item === "string").map(item => item.trim()).filter(Boolean) : [];
  const fallback = normalizeHomepage(undefined);
  return {
    backgroundVideo: stringValue(raw.backgroundVideo, fallback.backgroundVideo),
    liveFrameBackgroundVideo: stringValue(raw.liveFrameBackgroundVideo, fallback.liveFrameBackgroundVideo),
    aboutImage: stringValue(raw.aboutImage, fallback.aboutImage),
    featuredProjectId: stringValue(raw.featuredProjectId, fallback.featuredProjectId),
    reelProjectIds: list(raw.reelProjectIds),
    flowProjectIds: list(raw.flowProjectIds),
    reelVideoUrls: list(raw.reelVideoUrls),
    flowVideoUrls: list(raw.flowVideoUrls),
    slideKicker: stringValue(raw.slideKicker, fallback.slideKicker),
    slideItems: list(raw.slideItems),
    aboutEyebrow: stringValue(raw.aboutEyebrow, fallback.aboutEyebrow),
    aboutStamp: stringValue(raw.aboutStamp, fallback.aboutStamp),
    aboutHeadline: stringValue(raw.aboutHeadline, fallback.aboutHeadline),
    aboutBody: stringValue(raw.aboutBody, fallback.aboutBody),
    aboutSmall: stringValue(raw.aboutSmall, fallback.aboutSmall),
    aboutSignature: stringValue(raw.aboutSignature, fallback.aboutSignature),
    aboutPortfolio: Array.isArray(raw.aboutPortfolio) ? raw.aboutPortfolio.filter(item => item && typeof item.label === "string" && typeof item.items === "string") as HomepageContent["aboutPortfolio"] : fallback.aboutPortfolio,
    aboutFooterLeft: stringValue(raw.aboutFooterLeft, fallback.aboutFooterLeft),
    aboutFooterHeadline: stringValue(raw.aboutFooterHeadline, fallback.aboutFooterHeadline),
    aboutFooterRight: stringValue(raw.aboutFooterRight, fallback.aboutFooterRight),
  };
}

async function getPixabayMedia(): Promise<MediaItem[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return fallbackMedia;
  if (mediaCache && mediaCache.expiresAt > Date.now()) return mediaCache.videos;

  try {
    const groups = await Promise.all(pixabaySearches.map(async search => {
      const params = new URLSearchParams({ key: apiKey, q: search.q, per_page: "8", safesearch: "true", order: "popular" });
      const response = await fetch(`https://pixabay.com/api/videos/?${params.toString()}`);
      if (!response.ok) throw new Error(`Pixabay returned ${response.status}`);
      const data = await response.json() as PixabayResponse;
      return (data.hits ?? []).slice(0, 2).map((hit, index): MediaItem | null => {
        const source = hit.videos?.medium ?? hit.videos?.small ?? hit.videos?.tiny;
        if (!source?.url) return null;
        return {
          id: `pixabay-${hit.id ?? `${search.label}-${index}`}`,
          index: "00",
          label: search.label,
          title: index === 0 ? search.title : `${search.title} / take ${index + 1}`,
          tag: search.tag,
          duration: hit.duration,
          video: source.url,
          pageURL: hit.pageURL,
        };
      }).filter((item): item is MediaItem => Boolean(item));
    }));

    const fresh = groups.flat().map((item, index) => ({ ...item, index: String(index + 1).padStart(2, "0") })).slice(0, 8);
    const videos = fresh.length >= 4 ? fresh : fallbackMedia;
    mediaCache = { expiresAt: Date.now() + 10 * 60 * 1000, videos };
    return videos;
  } catch (error) {
    console.warn("[Pixabay] Falling back to curated public clips:", error instanceof Error ? error.message : "request failed");
    return fallbackMedia;
  }
}

async function uploadToProjectStorage(request: express.Request, filename: string, contentType: string, kind: "video" | "image") {
  const allowed = kind === "video" ? contentType.startsWith("video/") : contentType.startsWith("image/");
  if (!allowed) throw new Error("Tipo de ficheiro não permitido");
  const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-100) || `${kind}.bin`;
  const storagePath = `kavita/${kind}/${Date.now()}-${randomBytes(8).toString("hex")}-${safeName}`;
  const apiUrl = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;
  if (!apiUrl || !apiKey) throw new Error("Storage do projecto não está disponível");
  const presignResponse = await fetch(`${apiUrl}/v1/storage/presign/put?path=${encodeURIComponent(storagePath)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  const presign = await presignResponse.json() as { url?: string; error?: string };
  if (!presignResponse.ok || !presign.url) throw new Error(presign.error ?? "Não foi possível preparar o upload");
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > 300 * 1024 * 1024) throw new Error("O ficheiro excede o limite de 300 MB");
    chunks.push(buffer);
  }
  const putResponse = await fetch(presign.url, { method: "PUT", headers: { "Content-Type": contentType }, body: Buffer.concat(chunks) });
  if (!putResponse.ok) throw new Error("O storage recusou o ficheiro");
  return `/manus-storage/${storagePath}`;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.get("/api/site-content", async (_req, res) => {
    const content = await getContent(false);
    res.set("Cache-Control", "no-cache").json({ videos: content.projects, homepage: content.homepage, source: "Kavita content" });
  });
  app.get("/api/videos", async (_req, res) => {
    const content = await getContent(false);
    res.set("Cache-Control", "no-cache").json({ videos: content.projects, homepage: content.homepage, source: "Kavita content" });
  });
  app.get("/api/admin/session", (req, res) => res.json({ authenticated: isAdminRequest(req) }));
  app.post("/api/admin/login", (req, res) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!adminPassword() || !safeEqual(password, adminPassword())) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    res.cookie(ADMIN_COOKIE, createAdminToken(), { ...getSessionCookieOptions(req), maxAge: ADMIN_SESSION_SECONDS * 1000 });
    res.json({ authenticated: true });
  });
  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie(ADMIN_COOKIE, getSessionCookieOptions(req));
    res.json({ authenticated: false });
  });
  app.get("/api/admin/content", adminOnly, async (_req, res) => {
    const content = await getContent(true);
    res.set("Cache-Control", "no-store").json(content);
  });
  app.post("/api/admin/upload", adminOnly, async (req, res) => {
    try {
      const filename = String(req.query.filename ?? "ficheiro");
      const contentType = String(req.query.contentType ?? req.headers["content-type"] ?? "application/octet-stream");
      const kind = req.query.kind === "image" ? "image" : "video";
      const url = await uploadToProjectStorage(req, filename, contentType, kind);
      res.set("Cache-Control", "no-store").json({ url, filename });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Upload falhou" });
    }
  });
  app.put("/api/admin/projects/:id", adminOnly, async (req, res) => {
    const id = String(req.params.id).trim();
    if (!id || id.length > 128) {
      res.status(400).json({ error: "Invalid project id" });
      return;
    }
    const project = normalizeProjectPayload(id, req.body);
    await upsertProject(project);
    await saveProjectFrames(id, project.frames);
    res.set("Cache-Control", "no-store").json({ project });
  });
  app.delete("/api/admin/projects/:id", adminOnly, async (req, res) => {
    await deleteProject(String(req.params.id));
    res.set("Cache-Control", "no-store").json({ deleted: true });
  });
  app.put("/api/admin/homepage", adminOnly, async (req, res) => {
    const homepage = normalizeHomepagePayload(req.body);
    await saveHomepage(homepage);
    res.set("Cache-Control", "no-store").json({ homepage });
  });
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
