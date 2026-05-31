import fs from 'node:fs';
import path from 'node:path';

let sourceIndex = null;

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function collectImages(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectImages(item, output);
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  if (typeof value.url === 'string') output.push(value);
  for (const item of Object.values(value)) collectImages(item, output);
  return output;
}

function indexKey(url) {
  try {
    const parsed = new URL(url, 'https://local.invalid');
    return `${parsed.hostname}${decodeURIComponent(parsed.pathname)}`.toLowerCase();
  } catch {
    return String(url || '').split('?')[0].toLowerCase();
  }
}

function buildSourceIndex(rootDir) {
  const index = new Map();
  for (const file of ['data/legal-tour-images.json', 'data/legal-tour-landmark-images.json']) {
    const data = readJson(path.join(rootDir, file));
    for (const image of collectImages(data)) {
      if (!image.url) continue;
      const entry = {
        width: Number(image.width || 0) || null,
        height: Number(image.height || 0) || null,
        provider: typeof image.provider === 'string' ? image.provider : '',
        sourceUrl: typeof image.sourceUrl === 'string' ? image.sourceUrl : '',
        license: typeof image.license === 'string' ? image.license : '',
        source: file
      };
      index.set(image.url, entry);
      index.set(indexKey(image.url), entry);
    }
  }
  return index;
}

function parseDimensionsFromUrl(url) {
  const output = { width: null, height: null, source: 'url' };
  try {
    const parsed = new URL(url, 'https://local.invalid');
    const width = Number(parsed.searchParams.get('w') || parsed.searchParams.get('width') || 0);
    const height = Number(parsed.searchParams.get('h') || parsed.searchParams.get('height') || 0);
    if (width > 0) output.width = width;
    if (height > 0) output.height = height;
    const decodedPath = decodeURIComponent(parsed.pathname);
    const thumbWidth = decodedPath.match(/\/(\d{3,5})px-[^/]+$/i)?.[1];
    if (thumbWidth) output.width = Math.max(output.width || 0, Number(thumbWidth));
    const suffixSize = decodedPath.match(/-(\d{3,5})-(\d{3,5})\.(?:jpe?g|png|webp)$/i);
    if (suffixSize) {
      output.width = Number(suffixSize[1]);
      output.height = Number(suffixSize[2]);
    }
    if (/4k|uhd/i.test(`${decodedPath} ${parsed.search}`)) {
      output.width = Math.max(output.width || 0, 3840);
      output.height = Math.max(output.height || 0, 2160);
    }
  } catch {
    const width = String(url || '').match(/(?:w=|width=)(\d{3,5})/i)?.[1];
    if (width) output.width = Number(width);
  }
  return output.width || output.height ? output : null;
}

function readPngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), source: 'local-file-png' };
}

function readJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7), source: 'local-file-jpeg' };
    }
    offset += 2 + length;
  }
  return null;
}

function readLocalDimensions(url, rootDir) {
  if (!url.startsWith('/')) return null;
  const filePath = path.join(rootDir, 'public', url.replace(/^\/+/, '').split(/[?#]/)[0]);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return readPngDimensions(buffer) || readJpegDimensions(buffer);
}

export function getImageMetadata(url, rootDir = process.cwd()) {
  if (!sourceIndex) sourceIndex = buildSourceIndex(rootDir);
  const fromSource = sourceIndex.get(url) || sourceIndex.get(indexKey(url));
  const fromUrl = parseDimensionsFromUrl(url);
  const fromLocal = readLocalDimensions(url, rootDir);
  const merged = {
    ...(fromSource || {}),
    ...(fromUrl || {}),
    ...(fromLocal || {})
  };
  const width = Number(merged.width || 0) || null;
  const height = Number(merged.height || 0) || null;
  return {
    width,
    height,
    provider: merged.provider || '',
    sourceUrl: merged.sourceUrl || '',
    license: merged.license || '',
    dimensionSource: merged.source || (fromLocal ? fromLocal.source : fromUrl ? fromUrl.source : fromSource ? fromSource.source : '')
  };
}

export function isFourKLike(metadata) {
  return Number(metadata?.width || 0) >= 3840 || Number(metadata?.height || 0) >= 2160;
}
