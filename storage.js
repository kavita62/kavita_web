/**
 * Storage helpers for uploaded media.
 *
 * Strategy: content-addressed files. The same bytes always map to the same
 * file on disk, no matter how many projects/carousels reference them.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

const UPLOADS_PREFIX = '/uploads/';
const TRASH_DIRNAME = '_duplicados';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Hash a file without loading it all into memory. */
async function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  await pipeline(fs.createReadStream(filePath), hash);
  return hash.digest('hex');
}

/** List + hash every upload (skips folders and hidden files). */
async function scanUploads(uploadDir) {
  ensureDir(uploadDir);
  const files = [];
  const entries = fs.readdirSync(uploadDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue;
    const full = path.join(uploadDir, entry.name);
    const stat = fs.statSync(full);
    files.push({
      name: entry.name,
      size: stat.size,
      mtime: stat.mtimeMs,
      hash: await hashFile(full)
    });
  }
  return files;
}

function decodeName(name) {
  try {
    return decodeURIComponent(name);
  } catch (e) {
    return name;
  }
}

/** Collect every /uploads/<name> reference in the content tree. */
function referencedNames(data) {
  const counts = new Map();

  const walk = (node) => {
    if (!node) return;
    if (typeof node === 'string') {
      if (node.indexOf(UPLOADS_PREFIX) === -1) return;
      const re = /\/uploads\/([^"'\s?#]+)/g;
      let match;
      while ((match = re.exec(node))) {
        const name = decodeName(match[1]);
        counts.set(name, (counts.get(name) || 0) + 1);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  };

  walk(data);
  return counts;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a dedupe plan: one canonical file per content hash, plus a map from
 * every duplicate name to that canonical name.
 */
function planDedupe(data, scan) {
  const refs = referencedNames(data);
  const byHash = new Map();

  for (const file of scan) {
    if (!byHash.has(file.hash)) byHash.set(file.hash, []);
    byHash.get(file.hash).push(file);
  }

  const mapping = new Map();
  const renames = [];
  const staleNames = [];
  const duplicateGroups = [];
  let duplicateBytes = 0;

  for (const [hash, files] of byHash) {
    // If a content-addressed file already exists, it is the canonical one.
    const alreadyNamed = files.find((f) => f.name.lastIndexOf(hash + '.', 0) === 0) || null;

    // Otherwise prefer the file with more references, then the oldest name.
    const preferred = alreadyNamed || files.slice().sort((a, b) => {
      const ra = refs.get(a.name) || 0;
      const rb = refs.get(b.name) || 0;
      if (ra !== rb) return rb - ra;
      return a.name.localeCompare(b.name);
    })[0];

    const ext = path.extname(preferred.name) || '.bin';
    const canonical = hash + ext;
    const extras = files.filter((f) => f.name !== preferred.name);

    files.forEach((f) => mapping.set(f.name, canonical));
    if (preferred.name !== canonical) {
      renames.push({ from: preferred.name, to: canonical, size: preferred.size });
    }
    extras.forEach((f) => staleNames.push(f.name));

    if (files.length > 1) {
      const reclaimable = extras.reduce((sum, f) => sum + f.size, 0);
      duplicateBytes += reclaimable;
      duplicateGroups.push({
        hash,
        canonical,
        size: files[0].size,
        reclaimableBytes: reclaimable,
        files: files.map((f) => ({
          name: f.name,
          size: f.size,
          refs: refs.get(f.name) || 0
        }))
      });
    }
  }

  const existingNames = new Set(scan.map((f) => f.name));
  const missingRefs = [...refs.keys()].filter((name) => !existingNames.has(name));

  // A file counts as used if any reference resolves to the same content, even
  // when that reference still points at another copy of the same video.
  const effectiveRefs = new Map();
  for (const [name, count] of refs) {
    const canonical = mapping.get(name) || name;
    effectiveRefs.set(canonical, (effectiveRefs.get(canonical) || 0) + count);
  }

  const isUsed = (file) => effectiveRefs.has(mapping.get(file.name) || file.name);
  const orphans = scan.filter((f) => !isUsed(f));
  const totalBytes = scan.reduce((sum, f) => sum + f.size, 0);
  const uniqueBytes = [...byHash.values()].reduce((sum, files) => sum + files[0].size, 0);
  const referencedFiles = scan.filter(isUsed).length;

  return {
    refs,
    mapping,
    renames,
    staleNames: [...new Set(staleNames)],
    duplicateGroups,
    missingRefs,
    orphans,
    summary: {
      files: scan.length,
      totalBytes,
      uniqueFiles: byHash.size,
      uniqueBytes,
      duplicateFiles: scan.length - byHash.size,
      duplicateBytes,
      referencedFiles,
      orphanFiles: orphans.length,
      orphanBytes: orphans.reduce((sum, f) => sum + f.size, 0),
      missingRefs: missingRefs.length
    }
  };
}

/**
 * Rewrite every reference to a duplicate so it points at the canonical file.
 * Mutates `data` in place and returns the number of updated references.
 */
function applyMappingToData(data, mapping) {
  const targets = [...mapping.entries()].filter(([from, to]) => from !== to);
  if (!targets.length) return 0;

  const lookup = new Map(targets);
  const re = new RegExp('/uploads/(' + targets.map(([from]) => escapeRegExp(from)).join('|') + ')', 'g');
  let changed = 0;

  const walk = (node) => {
    if (!node) return node;
    if (typeof node === 'string') {
      return node.replace(re, (match, name) => {
        changed += 1;
        return UPLOADS_PREFIX + lookup.get(name);
      });
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) node[i] = walk(node[i]);
      return node;
    }
    if (typeof node === 'object') {
      for (const key of Object.keys(node)) node[key] = walk(node[key]);
      return node;
    }
    return node;
  };

  walk(data);
  return changed;
}

/**
 * Rename files so their names are their content hashes.
 *
 * Uses a two-phase move (source -> temporary name -> final name) so renames
 * never depend on their order and never overwrite unrelated content.
 * Returns the applied renames so the caller can roll back on failure.
 */
function applyRenames(uploadDir, renames) {
  if (!renames || !renames.length) return [];

  const stamp = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const applied = [];

  // Phase 1: move every source out of the way.
  try {
    for (let i = 0; i < renames.length; i += 1) {
      const item = renames[i];
      const src = path.join(uploadDir, item.from);
      if (!fs.existsSync(src)) {
        throw new Error('Ficheiro em falta: ' + item.from);
      }
      const tmp = path.join(uploadDir, `.tmp-rename-${stamp}-${i}`);
      fs.renameSync(src, tmp);
      applied.push({ tmp, from: item.from, to: item.to });
    }

    // Phase 2 targets must be free now. If one is still taken, the site would
    // end up serving the wrong content, so stop before writing anything.
    for (const item of applied) {
      if (fs.existsSync(path.join(uploadDir, item.to))) {
        throw new Error('Destino já ocupado: ' + item.to);
      }
    }

    // Phase 3: temporary name -> final hash name.
    for (const item of applied) {
      fs.renameSync(item.tmp, path.join(uploadDir, item.to));
    }

    return applied.slice();
  } catch (e) {
    rollbackRenames(uploadDir, applied);
    throw e;
  }
}

/** Undo applyRenames (works whether the file is still temporary or renamed). */
function rollbackRenames(uploadDir, applied) {
  if (!applied || !applied.length) return;
  for (let i = applied.length - 1; i >= 0; i -= 1) {
    const item = applied[i];
    const tmp = item.tmp;
    const final = path.join(uploadDir, item.to);
    const original = path.join(uploadDir, item.from);

    try {
      if (fs.existsSync(tmp) && !fs.existsSync(original)) {
        fs.renameSync(tmp, original);
      } else if (fs.existsSync(final) && !fs.existsSync(original)) {
        fs.renameSync(final, original);
      }
    } catch (e) {
      // Best effort: leave the file where it is and keep going.
    }
  }
}

/** Move files into uploads/_duplicados, never overwriting an existing file. */
function moveToTrash(uploadDir, names) {
  const trashDir = path.join(uploadDir, TRASH_DIRNAME);
  ensureDir(trashDir);
  const moved = [];

  for (const name of names) {
    const src = path.join(uploadDir, name);
    if (!fs.existsSync(src)) continue;

    let dest = path.join(trashDir, name);
    if (fs.existsSync(dest)) {
      const ext = path.extname(name);
      const base = path.basename(name, ext);
      dest = path.join(trashDir, base + '-' + Date.now() + ext);
    }

    const size = fs.statSync(src).size;
    fs.renameSync(src, dest);
    moved.push({ name, size, to: path.relative(uploadDir, dest) });
  }

  return moved;
}

/** Move every duplicate copy (all files except the canonical one). */
function moveDuplicates(uploadDir, plan) {
  return moveToTrash(uploadDir, plan.staleNames || []);
}

/** Move the leftover copies listed by the plan (same as moveDuplicates). */
function moveStale(uploadDir, plan) {
  return moveToTrash(uploadDir, plan.staleNames || []);
}

function moveOrphans(uploadDir, plan) {
  const stale = new Set(plan.staleNames || []);
  // Stale duplicates are handled by moveStale; only move genuine leftovers.
  const names = plan.orphans
    .map((f) => f.name)
    .filter((name) => !stale.has(name));
  return moveToTrash(uploadDir, names);
}

module.exports = {
  UPLOADS_PREFIX,
  TRASH_DIRNAME,
  ensureDir,
  hashFile,
  scanUploads,
  referencedNames,
  planDedupe,
  applyMappingToData,
  applyRenames,
  rollbackRenames,
  moveDuplicates,
  moveStale,
  moveOrphans
};
