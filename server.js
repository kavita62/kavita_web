/**
 * Kavita Uchila - Static Site Backend
 * Express server with API for admin content persistence
 * Serves static files + provides /api/admin/* endpoints
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const storage = require('./storage_v2');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'site-content.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TEMP_DIR = path.join(__dirname, '.tmp-uploads');
const BACKUP_DIR = path.join(__dirname, 'data', 'backups');

// Ensure directories exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Clear orphaned upload temp files from previous runs
try {
  fs.readdirSync(TEMP_DIR).forEach((name) => {
    try { fs.unlinkSync(path.join(TEMP_DIR, name)); } catch (e) {}
  });
} catch (e) {}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Uploaded media: content-addressed files served from /uploads/<hash>.<ext>
// Mounted before the root static middleware so these headers actually apply.
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '365d',
  immutable: true
}));

// Serve static files from root
app.use(express.static(__dirname, {
  index: 'preview.html',
  maxAge: '0' // No cache for development
}));

// Alias: /preview -> homepage (preview.html)
app.get('/preview', (req, res) => {
  res.redirect(301, '/');
});

// Default seed data
const SEED_DATA = {
  projects: [
    {
      id: "piano-40390", index: "01", label: "MÚSICA", title: "Mãos no som",
      tag: "ESTÚDIO / RITMO", description: "Um estudo táctil de mãos, ritmo e da electricidade silenciosa de uma sala antes da primeira nota.",
      role: "DIRECÇÃO VISUAL / IMAGEM EM MOVIMENTO", location: "LUANDA / MUNDO", year: "2026", duration: 20,
      video: "https://cdn.pixabay.com/video/2020/05/28/40390-425442522_medium.mp4",
      coverImage: "", coverVideo: "", template: "cinematic", frames: [], pageURL: "",
      featured: false, published: true, sortOrder: 0
    },
    {
      id: "portrait-316579", index: "02", label: "RETRATO", title: "Novas silhuetas",
      tag: "MODA / FORMA", description: "Retratos que se movem como tecido: directos, íntimos e construídos no instante em que uma silhueta se torna presença.",
      role: "CAMPANHA / DIRECÇÃO DE ARTE", location: "LUANDA / MUNDO", year: "2026", duration: 6,
      video: "https://cdn.pixabay.com/video/2025/11/17/316579_medium.mp4",
      coverImage: "", coverVideo: "", template: "editorial", frames: [], pageURL: "",
      featured: true, published: true, sortOrder: 1
    },
    {
      id: "dance-75547", index: "03", label: "MOVIMENTO", title: "Corpos no frame",
      tag: "PERFORMANCE / ENERGIA", description: "Corpos em movimento, cortados pelo beat. Um fragmento sobre energia, libertação e a forma de um gesto.",
      role: "PERFORMANCE / EDITORIAL", location: "LUANDA / MUNDO", year: "2026", duration: 17,
      video: "https://cdn.pixabay.com/video/2021/05/28/75547-556034400_medium.mp4",
      coverImage: "", coverVideo: "", template: "gallery", frames: [], pageURL: "",
      featured: false, published: true, sortOrder: 2
    },
    {
      id: "fashion-362758", index: "04", label: "EDITORIAL", title: "A luz encontra a pele",
      tag: "CAMPANHA / TEXTURA", description: "Um estudo sobre a luz a encontrar a pele, a textura e a geometria imperfeita de um frame em movimento.",
      role: "CRIAÇÃO DE IMAGEM / DIRECÇÃO", location: "LUANDA / MUNDO", year: "2026", duration: 12,
      video: "https://cdn.pixabay.com/video/2026/07/08/362758_medium.mp4",
      coverImage: "", coverVideo: "", template: "split", frames: [], pageURL: "",
      featured: false, published: true, sortOrder: 3
    },
    {
      id: "dj-13071", index: "05", label: "SOM", title: "Depois do beat",
      tag: "MÚSICA / ATITUDE", description: "Depois do beat, a imagem continua a mover-se. O som torna-se postura, cor e uma sala cheia de sinal.",
      role: "MÚSICA / SISTEMA VISUAL", location: "LUANDA / MUNDO", year: "2026", duration: 15,
      video: "https://cdn.pixabay.com/video/2017/11/26/13071-244835811_medium.mp4",
      coverImage: "", coverVideo: "", template: "cinematic", frames: [], pageURL: "",
      featured: false, published: true, sortOrder: 4
    },
    {
      id: "studio-33517", index: "06", label: "PESSOAS", title: "O grande plano",
      tag: "RETRATO / PRESENÇA", description: "Um grande plano nunca está parado. Um retrato de atenção, proximidade e dos detalhes que ficam connosco.",
      role: "RETRATO / IMAGEM EM MOVIMENTO", location: "LUANDA / MUNDO", year: "2026", duration: 13,
      video: "https://cdn.pixabay.com/video/2020/03/11/33517-397143847_medium.mp4",
      coverImage: "", coverVideo: "", template: "editorial", frames: [], pageURL: "",
      featured: false, published: true, sortOrder: 5
    }
  ],
  homepage: {
    backgroundVideo: "",
    liveFrameBackgroundVideo: "",
    slideKicker: "KAVITA UCHILA",
    slideItems: [
      "IMAGEM COM PULSO",
      "DIRECÇÃO VISUAL",
      "MOTION DESIGN",
      "3D & CONCEITO"
    ],
    reelVideoUrls: [],
    flowVideoUrls: [],
    aboutEyebrow: "SOBRE / GERSON GEREMIAS UCHILA",
    aboutStamp: "TAMBÉM KAVITA UCHILA",
    aboutImage: "",
    aboutHeadline: "Duas forças movem cada frame: uma ideia visual com impacto e código que a faz funcionar.",
    aboutBody: "A paixão por videojogos, cinema, modelação 3D e criação de conceitos levou Gerson Geremias Uchila a construir universos visuais para marcas, música, cultura e pessoas. Hoje trabalha de forma independente, com a pequena equipa Planilha, juntando direção visual, motion, 3D, design e novas ferramentas de inteligência artificial.",
    aboutSignature: "Gerson Geremias Uchila\nDiretor visual · artista 3D · tecnólogo criativo",
    aboutSmall: "LUANDA / MUNDO",
    aboutPortfolio: [
      { label: "DESIGN GRÁFICO", items: "Universo Digital TV · Optims · Chimuma · Kolapo Arquitectura · Convénios Solution · Fab Pro · Moldar · FTE · Koolba" },
      { label: "AUDIOVISUAL / MOTION", items: "FTE Video Promo · Kanuca · Missão Angola · Ginástica Na Minha Banda" },
      { label: "ARTE 3D", items: "Design de interiores · Kolapo · Trabalhos pessoais · ZBrush" },
      { label: "STARTUPS", items: "Vab · Skikies · Farmy dos Criadores" },
      { label: "GALERIAS / EVENTOS", items: "Expo Recicla · FTE · Morna" }
    ],
    aboutFooterLeft: "KAVITA UCHILA",
    aboutFooterHeadline: "IMAGEM COM PULSO",
    aboutFooterRight: "LUANDA / MUNDO"
  }
};

// Load data from file or use seed
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(raw);
      // Merge with seed to ensure all fields exist
      return { ...SEED_DATA, ...data, projects: data.projects || SEED_DATA.projects, homepage: { ...SEED_DATA.homepage, ...data.homepage } };
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return SEED_DATA;
}

// Save data to file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving data:', e);
    return false;
  }
}

let siteData = loadData();

// Ensure gallery fields exist in server memory
if (!Array.isArray(siteData.gallery)) siteData.gallery = [];
if (typeof siteData.galleryCoverImage !== 'string') siteData.galleryCoverImage = '';
if (typeof siteData.galleryCoverVideo !== 'string') siteData.galleryCoverVideo = '';

// API Routes

// GET /api/site-content - Public content for preview/project pages
app.get('/api/site-content', (req, res) => {
  res.json(siteData);
});

// GET /api/admin/content - Full content for admin panel
app.get('/api/admin/content', (req, res) => {
  res.json(siteData);
});

// POST /api/admin/content - Save all content from admin
app.post('/api/admin/content', (req, res) => {
  const { projects, homepage, gallery, galleryCoverImage, galleryCoverVideo } = req.body;

  if (!projects || !homepage) {
    return res.status(400).json({ error: 'Invalid payload: projects and homepage required' });
  }

  siteData = {
    projects: projects.map((p, i) => ({ ...p, sortOrder: p.sortOrder ?? i })),
    homepage,
    gallery: Array.isArray(gallery) ? gallery : [],
    galleryCoverImage: galleryCoverImage || '',
    galleryCoverVideo: galleryCoverVideo || ''
  };

  if (saveData(siteData)) {
    res.json({ success: true, message: 'Conteúdo guardado com sucesso' });
  } else {
    res.status(500).json({ error: 'Erro ao guardar' });
  }
});

// POST /api/admin/upload - Content-addressed upload (same bytes = same file)
const multer = require('multer');
const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Upload genérico (sem associação a projeto - usado para compatibilidade)
app.post('/api/admin/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const tempPath = req.file.path;
  try {
    const hash = await storage.hashFile(tempPath);
    const ext = (path.extname(req.file.originalname) || '.bin').toLowerCase();
    const canonicalName = hash + ext;
    const canonicalPath = path.join(UPLOAD_DIR, canonicalName);

    if (!fs.existsSync(canonicalPath)) {
      fs.renameSync(tempPath, canonicalPath);
    } else {
      fs.unlinkSync(tempPath);
    }

    res.json({
      url: `/uploads/${canonicalName}`,
      filename: canonicalName,
      hash,
      reused: fs.existsSync(canonicalPath),
      size: req.file.size
    });
  } catch (e) {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (err) {}
    console.error('Upload error:', e);
    res.status(500).json({ error: 'Erro ao processar o ficheiro' });
  }
});

// POST /api/admin/project/:id/upload - Upload associado a um projeto específico
app.post('/api/admin/project/:id/upload', upload.single('file'), async (req, res) => {
  const projectId = req.params.id;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const tempPath = req.file.path;
  try {
    const result = await storage.addFileToProject(projectId, tempPath, req.file.originalname);
    res.json({
      url: result.url,
      filename: result.canonicalName,
      hash: result.hash,
      size: result.size,
      projectId,
      message: 'Ficheiro associado ao projeto'
    });
  } catch (e) {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (err) {}
    console.error('Project upload error:', e);
    res.status(500).json({ error: 'Erro ao associar ficheiro ao projeto' });
  }
});

// GET /api/admin/project/:id/files - Lista arquivos de um projeto
app.get('/api/admin/project/:id/files', (req, res) => {
  const projectId = req.params.id;
  const files = storage.getProjectFiles(projectId);
  res.json({ projectId, files, count: files.length });
});

// DELETE /api/admin/project/:id/files/:hash - Remove arquivo de um projeto
app.delete('/api/admin/project/:id/files/:hash', (req, res) => {
  const projectId = req.params.id;
  const hash = req.params.hash;
  storage.removeFileFromProject(projectId, hash);
  res.json({ success: true, projectId, hash });
});

// GET /api/admin/storage/manifests - Lista todos os manifestos
app.get('/api/admin/storage/manifests', (req, res) => {
  const manifestDir = path.join(__dirname, storage.MANIFEST_DIR);
  const files = fs.existsSync(manifestDir)
    ? fs.readdirSync(manifestDir).filter(f => f.endsWith('.json') && f !== '_index.json')
    : [];
  const manifests = files.map(f => {
    const manifest = storage.readManifest(f.replace('.json', ''));
    return {
      projectId: manifest.projectId,
      fileCount: manifest.files.length,
      updatedAt: manifest.updatedAt
    };
  });
  res.json({ manifests });
});

// POST /api/admin/storage/migrate - Migra estrutura antiga para manifestos
app.post('/api/admin/storage/migrate', async (req, res) => {
  try {
    // Re-carregar dados do servidor para migração
    const dataFile = path.join(__dirname, 'data', 'site-content.json');
    let siteContent = null;
    if (fs.existsSync(dataFile)) {
      siteContent = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
    const result = await storage.migrateFromFlat(UPLOAD_DIR, siteContent);
    res.json({
      success: true,
      migrated: result.migrated,
      message: `Migrados ${result.migrated} arquivos para manifestos`
    });
  } catch (e) {
    console.error('Migration error:', e);
    res.status(500).json({ error: 'Erro na migração: ' + e.message });
  }
});

// Admin login (simple - any password works for static demo)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  // In production, verify against hashed password
  if (password && password.length >= 1) {
    res.json({ success: true, token: 'static-demo-token' });
  } else {
    res.status(401).json({ error: 'Password required' });
  }
});

// Reset to seed data
app.post('/api/admin/reset', (req, res) => {
  siteData = JSON.parse(JSON.stringify(SEED_DATA));
  saveData(siteData);
  res.json({ success: true, message: 'Dados repostos aos originais' });
});

function backupDataFile() {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(BACKUP_DIR, `site-content-${stamp}.json`);
    fs.copyFileSync(DATA_FILE, dest);
    return path.relative(__dirname, dest);
  } catch (e) {
    console.error('Backup error:', e);
    return null;
  }
}

async function storagePlan() {
  const scan = await storage.scanUploads(UPLOAD_DIR);
  return storage.planDedupe(siteData, scan);
}

// GET /api/admin/storage - Storage report (files, duplicates, orphans)
app.get('/api/admin/storage', async (req, res) => {
  try {
    const plan = await storagePlan();
    res.json({
      summary: plan.summary,
      duplicateGroups: plan.duplicateGroups,
      renames: plan.renames,
      orphans: plan.orphans.map((f) => ({ name: f.name, size: f.size })),
      missingRefs: plan.missingRefs
    });
  } catch (e) {
    console.error('Storage report error:', e);
    res.status(500).json({ error: 'Erro ao analisar o armazenamento' });
  }
});

// POST /api/admin/storage/dedupe - One canonical hash-named file per content
app.post('/api/admin/storage/dedupe', async (req, res) => {
  let applied = [];
  let snapshot = null;

  try {
    const plan = await storagePlan();

    if (plan.missingRefs.length) {
      return res.status(409).json({
        error: 'Existem referências para ficheiros em falta. Restaura-os antes de deduplicar.',
        missingRefs: plan.missingRefs
      });
    }

    if (!plan.renames.length && !plan.staleNames.length) {
      return res.json({
        success: true,
        backup: null,
        moved: [],
        updatedRefs: 0,
        summary: plan.summary,
        message: 'Todos os ficheiros já estão otimizados.'
      });
    }

    const backup = backupDataFile();
    snapshot = JSON.parse(JSON.stringify(siteData));

    // 1) Give every file its content-hash name.
    applied = storage.applyRenames(UPLOAD_DIR, plan.renames);

    // 2) Point every reference at the canonical file.
    const updatedRefs = storage.applyMappingToData(siteData, plan.mapping);

    // 3) Persist. If this fails, undo both the names and the content.
    if (!saveData(siteData)) {
      throw new Error('Não foi possível guardar o conteúdo atualizado.');
    }

    // 4) Only after the references are safe, park the leftover copies.
    let moved = [];
    let moveError = null;
    try {
      moved = storage.moveStale(UPLOAD_DIR, plan);
    } catch (e) {
      moveError = e.message;
      console.error('Dedupe move error:', e);
    }

    res.json({
      success: true,
      backup,
      renamed: applied.length,
      moved,
      updatedRefs,
      moveError,
      summary: plan.summary,
      message: 'Ficheiros consolidados.'
    });
  } catch (e) {
    console.error('Dedupe error:', e);

    if (snapshot) {
      siteData = snapshot;
    }
    storage.rollbackRenames(UPLOAD_DIR, applied);

    res.status(500).json({ error: e.message || 'Erro ao deduplicar ficheiros' });
  }
});

// POST /api/admin/storage/cleanup - Move unreferenced files to _duplicados
app.post('/api/admin/storage/cleanup', async (req, res) => {
  try {
    const plan = await storagePlan();
    const moved = storage.moveOrphans(UPLOAD_DIR, plan);
    res.json({
      success: true,
      moved,
      freedBytes: moved.reduce((sum, f) => sum + f.size, 0),
      message: moved.length ? 'Ficheiros não usados movidos para _duplicados.' : 'Não existem ficheiros não usados.'
    });
  } catch (e) {
    console.error('Cleanup error:', e);
    res.status(500).json({ error: 'Erro ao limpar ficheiros não usados' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Kavita Uchila - Static Site Server                          ║
║  Running on http://localhost:${PORT}                            ║
║                                                              ║
║  API Endpoints:                                              ║
║    GET  /api/site-content     - Public site content          ║
║    GET  /api/admin/content    - Admin content                ║
║    POST /api/admin/content    - Save admin content           ║
║    POST /api/admin/upload     - Upload file                  ║
║    POST /api/admin/login      - Admin login                  ║
║    POST /api/admin/reset      - Reset to seed data           ║
║                                                              ║
║  Data file: ${DATA_FILE}                                    ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;