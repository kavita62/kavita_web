/**
 * Storage V2 - Organização lógica de arquivos por projeto
 *
 * Conceitos:
 * - Arquivos físicos: /uploads/<hash>.<ext>  (content-addressed, deduplicados)
 * - Manifestos: /data/manifests/<projectId>.json  (lista de hashes que o projeto usa)
 * - Índice reverso: /data/manifests/_index.json  (hash -> [projectIds que usam])
 *
 * Vantagens:
 * - Mesmo arquivo servido para múltiplos projetos (sem duplicar upload)
 * - Cada projeto tem sua "pasta lógica" via manifesto
 * - Carrosséis referenciam projectIds, resolvem para hashes via manifesto
 * - Limpeza precisa: sabe exatamente quais projetos usam cada arquivo
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

const UPLOAD_DIR = 'uploads';
const MANIFEST_DIR = path.join('data', 'manifests');
const INDEX_FILE = path.join(MANIFEST_DIR, '_index.json');
const TRASH_DIRNAME = '_duplicados';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/** Lê o índice reverso (hash -> projectIds) */
function readIndex() {
  try {
    if (fs.existsSync(INDEX_FILE)) {
      return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

/** Escreve o índice reverso */
function writeIndex(index) {
  ensureDir(MANIFEST_DIR);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
}

/** Lê o manifesto de um projeto */
function readManifest(projectId) {
  const file = path.join(MANIFEST_DIR, `${projectId}.json`);
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return { projectId, files: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

/** Escreve o manifesto de um projeto */
function writeManifest(manifest) {
  ensureDir(MANIFEST_DIR);
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(MANIFEST_DIR, `${manifest.projectId}.json`), JSON.stringify(manifest, null, 2), 'utf8');
}

/** Adiciona arquivo ao projeto (cria referência no manifesto e índice) */
async function addFileToProject(projectId, filePath, originalName) {
  const hash = await hashFile(filePath);
  const ext = path.extname(originalName).toLowerCase() || '.bin';
  const canonicalName = hash + ext;
  const canonicalPath = path.join(UPLOAD_DIR, canonicalName);

  // Move arquivo para nome canônico se necessário
  if (!fs.existsSync(canonicalPath)) {
    ensureDir(UPLOAD_DIR);
    fs.renameSync(filePath, canonicalPath);
  } else {
    // Arquivo já existe (mesmo conteúdo) - remove o temporário
    fs.unlinkSync(filePath);
  }

  // Atualiza manifesto do projeto
  const manifest = readManifest(projectId);
  const existing = manifest.files.find(f => f.hash === hash);
  if (!existing) {
    manifest.files.push({
      hash,
      canonicalName,
      originalName,
      addedAt: new Date().toISOString(),
      size: fs.statSync(canonicalPath).size
    });
    writeManifest(manifest);
  }

  // Atualiza índice reverso
  const index = readIndex();
  if (!index[hash]) index[hash] = [];
  if (!index[hash].includes(projectId)) {
    index[hash].push(projectId);
    writeIndex(index);
  }

  return { hash, canonicalName, url: `/uploads/${canonicalName}`, size: fs.statSync(canonicalPath).size };
}

/** Remove arquivo do projeto (remove do manifesto e índice) */
function removeFileFromProject(projectId, hash) {
  const manifest = readManifest(projectId);
  manifest.files = manifest.files.filter(f => f.hash !== hash);
  writeManifest(manifest);

  const index = readIndex();
  if (index[hash]) {
    index[hash] = index[hash].filter(id => id !== projectId);
    if (index[hash].length === 0) delete index[hash];
    writeIndex(index);
  }
}

/** Lista todos os arquivos de um projeto com metadados */
function getProjectFiles(projectId) {
  const manifest = readManifest(projectId);
  return manifest.files.map(f => ({
    ...f,
    url: `/uploads/${f.canonicalName}`
  }));
}

/** Verifica se um arquivo é usado por algum projeto */
function isFileReferenced(hash) {
  const index = readIndex();
  return index[hash] && index[hash].length > 0;
}

/** Obtém projetos que usam um arquivo */
function getProjectsUsingFile(hash) {
  const index = readIndex();
  return index[hash] || [];
}

/** Escaneia uploads e gera relatório completo */
async function scanUploads(uploadDir) {
  ensureDir(uploadDir);
  const files = [];
  const entries = fs.readdirSync(uploadDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue;
    if (entry.name === TRASH_DIRNAME) continue;
    const full = path.join(uploadDir, entry.name);
    const stat = fs.statSync(full);
    const hash = entry.name.split('.')[0]; // Assume formato hash.ext
    files.push({
      name: entry.name,
      hash,
      size: stat.size,
      mtime: stat.mtimeMs,
      referenced: isFileReferenced(hash),
      projects: getProjectsUsingFile(hash)
    });
  }
  return files;
}

/** Gera plano de limpeza: arquivos órfãos (não referenciados por nenhum projeto) */
function planCleanup(scan) {
  const orphans = scan.filter(f => !f.referenced);
  const totalBytes = scan.reduce((sum, f) => sum + f.size, 0);
  const orphanBytes = orphans.reduce((sum, f) => sum + f.size, 0);
  return {
    orphans: orphans.map(f => ({ name: f.name, size: f.size, hash: f.hash })),
    summary: {
      totalFiles: scan.length,
      totalBytes,
      orphanFiles: orphans.length,
      orphanBytes,
      referencedFiles: scan.length - orphans.length
    }
  };
}

/** Move órfãos para _duplicados */
function moveOrphans(uploadDir, orphanNames) {
  const trashDir = path.join(uploadDir, TRASH_DIRNAME);
  ensureDir(trashDir);
  const moved = [];
  for (const name of orphanNames) {
    const src = path.join(uploadDir, name);
    if (!fs.existsSync(src)) continue;
    let dest = path.join(trashDir, name);
    if (fs.existsSync(dest)) {
      const ext = path.extname(name);
      const base = path.basename(name, ext);
      dest = path.join(trashDir, `${base}-${Date.now()}${ext}`);
    }
    const size = fs.statSync(src).size;
    fs.renameSync(src, dest);
    moved.push({ name, size, to: path.relative(uploadDir, dest) });
  }
  return moved;
}

/** Sincroniza manifestos com a realidade (remove referências a arquivos deletados) */
function syncManifests() {
  const index = readIndex();
  const manifestFiles = fs.readdirSync(MANIFEST_DIR).filter(f => f.endsWith('.json') && f !== '_index.json');

  for (const file of manifestFiles) {
    const projectId = file.replace('.json', '');
    const manifest = readManifest(projectId);
    let changed = false;

    manifest.files = manifest.files.filter(f => {
      const exists = fs.existsSync(path.join(UPLOAD_DIR, f.canonicalName));
      if (!exists) {
        changed = true;
        return false;
      }
      return true;
    });

    if (changed) writeManifest(manifest);
  }

  // Limpa índice de hashes que não existem mais
  for (const hash of Object.keys(index)) {
    const exists = fs.readdirSync(UPLOAD_DIR).some(f => f.startsWith(hash + '.'));
    if (!exists) {
      delete index[hash];
    }
  }
  writeIndex(index);
}

/** Migra estrutura antiga (flat) para nova (com manifestos) */
async function migrateFromFlat(uploadDir, siteData) {
  const index = readIndex();
  let migrated = 0;

  // Para cada projeto no siteData, cria manifesto baseado nas URLs referenciadas
  if (siteData.projects) {
    for (const project of siteData.projects) {
      const manifest = readManifest(project.id);
      const urls = [
        project.video,
        project.coverImage,
        project.coverVideo,
        ...(project.frames || []).map(f => f.src)
      ].filter(Boolean);

      for (const url of urls) {
        const match = url.match(/\/uploads\/([^"'\s?#]+)/);
        if (match) {
          const name = match[1];
          const hash = name.split('.')[0];
          if (!manifest.files.find(f => f.hash === hash)) {
            const fullPath = path.join(uploadDir, name);
            if (fs.existsSync(fullPath)) {
              // Verifica se hash confere
              const realHash = await hashFile(fullPath);
              if (realHash === hash) {
                manifest.files.push({
                  hash,
                  canonicalName: name,
                  originalName: name,
                  addedAt: new Date().toISOString(),
                  size: fs.statSync(fullPath).size
                });
                if (!index[hash]) index[hash] = [];
                if (!index[hash].includes(project.id)) {
                  index[hash].push(project.id);
                }
                migrated++;
              }
            }
          }
        }
      }
      writeManifest(manifest);
    }
  }

  // Carrosséis da homepage
  const homepage = siteData.homepage || {};
  const carouselUrls = [
    ...(homepage.reelVideoUrls || []),
    ...(homepage.flowVideoUrls || []),
    homepage.backgroundVideo,
    homepage.liveFrameBackgroundVideo,
    homepage.aboutImage
  ].filter(Boolean);

  const carouselManifest = readManifest('homepage-carousels');
  for (const url of carouselUrls) {
    const match = url.match(/\/uploads\/([^"'\s?#]+)/);
    if (match) {
      const name = match[1];
      const hash = name.split('.')[0];
      if (!carouselManifest.files.find(f => f.hash === hash)) {
        const fullPath = path.join(uploadDir, name);
        if (fs.existsSync(fullPath)) {
          const realHash = await hashFile(fullPath);
          if (realHash === hash) {
            carouselManifest.files.push({
              hash,
              canonicalName: name,
              originalName: name,
              addedAt: new Date().toISOString(),
              size: fs.statSync(fullPath).size
            });
            if (!index[hash]) index[hash] = [];
            if (!index[hash].includes('homepage-carousels')) {
              index[hash].push('homepage-carousels');
            }
            migrated++;
          }
        }
      }
    }
  }
  writeManifest(carouselManifest);
  writeIndex(index);

  return { migrated, index };
}

module.exports = {
  UPLOAD_DIR,
  MANIFEST_DIR,
  INDEX_FILE,
  TRASH_DIRNAME,
  ensureDir,
  hashFile,
  readManifest,
  writeManifest,
  readIndex,
  writeIndex,
  addFileToProject,
  removeFileFromProject,
  getProjectFiles,
  isFileReferenced,
  getProjectsUsingFile,
  scanUploads,
  planCleanup,
  moveOrphans,
  syncManifests,
  migrateFromFlat
};