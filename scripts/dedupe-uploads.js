#!/usr/bin/env node
/**
 * Storage maintenance for the Kavita Uchila site.
 *
 * Usage:
 *   node scripts/dedupe-uploads.js            -> report only (dry-run)
 *   node scripts/dedupe-uploads.js --apply    -> consolidate duplicates
 *   node scripts/dedupe-uploads.js --apply --cleanup
 *
 * The script talks to the running server so the in-memory content and the
 * JSON file stay in sync. A backup is created before any change.
 */

const BASE = process.env.KAVITA_URL || 'http://localhost:3000';

function humanSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function getJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const cleanup = process.argv.includes('--cleanup');

  const report = await getJson(BASE + '/api/admin/storage');
  const s = report.summary || {};

  console.log('');
  console.log('ARMAZENAMENTO');
  console.log('  Ficheiros:        ' + (s.files || 0) + '  (' + humanSize(s.totalBytes) + ')');
  console.log('  Conteúdo único:   ' + (s.uniqueFiles || 0) + '  (' + humanSize(s.uniqueBytes) + ')');
  console.log('  Duplicados:       ' + (s.duplicateFiles || 0) + '  (' + humanSize(s.duplicateBytes) + ' recuperáveis)');
  console.log('  Não usados:       ' + (s.orphanFiles || 0) + '  (' + humanSize(s.orphanBytes) + ')');

  if (report.missingRefs && report.missingRefs.length) {
    console.log('');
    console.log('ATENÇÃO: referências para ficheiros em falta:');
    report.missingRefs.forEach((name) => console.log('  - ' + name));
    console.log('Restaura esses ficheiros antes de deduplicar.');
  }

  const groups = report.duplicateGroups || [];
  const renames = report.renames || [];
  if (groups.length) {
    console.log('');
    console.log('DUPLICADOS');
    groups.forEach((g) => {
      console.log('  ' + g.canonical + '  (' + humanSize(g.size) + ' × ' + g.files.length + ')');
      g.files.forEach((f) => {
        console.log('    - ' + f.name + '  refs=' + f.refs);
      });
    });
  } else {
    console.log('');
    console.log('Sem duplicados.');
  }

  if (renames.length) {
    console.log('');
    console.log('RENOMEAR PARA O HASH DO CONTEÚDO');
    renames.forEach((r) => console.log('  ' + r.from + '  ->  ' + r.to));
  }

  if (!apply) {
    console.log('');
    console.log('Isto foi só um relatório. Para aplicar: node scripts/dedupe-uploads.js --apply');
    return;
  }

  if (report.missingRefs && report.missingRefs.length) {
    throw new Error('Não vou deduplicar com referências em falta.');
  }

  const result = await getJson(BASE + '/api/admin/storage/dedupe', { method: 'POST' });
  console.log('');
  console.log('DEDUPE APLICADO');
  console.log('  Ficheiros renomeados:  ' + (result.renamed || 0));
  console.log('  Cópias movidas:        ' + (result.moved ? result.moved.length : 0));
  console.log('  Referências ajustadas: ' + (result.updatedRefs || 0));
  if (result.backup) console.log('  Backup:                ' + result.backup);
  if (result.moveError) console.log('  Aviso:                 ' + result.moveError);

  if (cleanup) {
    const cleaned = await getJson(BASE + '/api/admin/storage/cleanup', { method: 'POST' });
    console.log('');
    console.log('LIMPEZA');
    console.log('  Ficheiros movidos: ' + (cleaned.moved ? cleaned.moved.length : 0) + '  (' + humanSize(cleaned.freedBytes) + ')');
  }
}

main().catch((err) => {
  console.error('Erro: ' + (err && err.message ? err.message : err));
  process.exit(1);
});
