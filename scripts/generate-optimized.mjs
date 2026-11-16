/**
 * Generate WebP + AVIF versions of every image referenced by the site.
 * Output: optimized/webp/uploads/<hash>.webp, optimized/avif/uploads/<hash>.avif
 * Safe to run repeatedly - skips files that already exist.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const UPLOADS = path.join(ROOT, 'uploads');
const WEBP = path.join(ROOT, 'optimized', 'webp', 'uploads');
const AVIF = path.join(ROOT, 'optimized', 'avif', 'uploads');
const IMAGE_EXT = /\.(png|jpe?g|webp|avif)$/i;

// Collect every /uploads/<file> reference from HTML + site content.
let text = '';
for (const f of fs.readdirSync(ROOT)) {
  if (f.endsWith('.html')) text += fs.readFileSync(path.join(ROOT, f), 'utf8');
}
text += fs.readFileSync(path.join(ROOT, 'data', 'site-content.json'), 'utf8');

const refs = new Set(
  [...text.matchAll(/\/uploads\/([A-Za-z0-9_.\-]+)/g)]
    .map((m) => m[1])
    .filter((f) => IMAGE_EXT.test(f))
);

fs.mkdirSync(WEBP, { recursive: true });
fs.mkdirSync(AVIF, { recursive: true });

let converted = 0, skipped = 0, failed = 0, savedBytes = 0;

for (const file of refs) {
  const src = path.join(UPLOADS, file);
  if (!fs.existsSync(src)) continue;
  const base = file.replace(IMAGE_EXT, '');
  const webpOut = path.join(WEBP, base + '.webp');
  const avifOut = path.join(AVIF, base + '.avif');
  if (fs.existsSync(webpOut) && fs.existsSync(avifOut)) { skipped++; continue; }

  try {
    const input = fs.readFileSync(src);
    if (!fs.existsSync(webpOut)) {
      await sharp(input).rotate().resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 }).toFile(webpOut);
    }
    if (!fs.existsSync(avifOut)) {
      await sharp(input).rotate().resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 50, effort: 4 }).toFile(avifOut);
    }
    savedBytes += fs.statSync(src).size - fs.statSync(webpOut).size;
    converted++;
  } catch (e) {
    console.warn('FAILED', file, e.message);
    failed++;
  }
}

console.log(`referenced images: ${refs.size}`);
console.log(`converted: ${converted}, already present: ${skipped}, failed: ${failed}`);
console.log(`estimated savings (original -> webp): ${(savedBytes / 1048576).toFixed(1)} MB`);
