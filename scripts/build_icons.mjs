// Generate the full PWA / favicon icon set from public/icon.svg.
//
// Outputs in public/:
//   favicon.ico              48×48 PNG-as-ICO (browsers accept this)
//   favicon-16x16.png        high-DPI tab icon
//   favicon-32x32.png
//   apple-touch-icon.png     180×180 (iOS home-screen)
//   pwa-192x192.png          Android home-screen
//   pwa-512x512.png          Android splash, app-store hero
//   pwa-maskable-512x512.png Android adaptive icon (12% safe zone)
//   mstile-150x150.png       Windows / Edge tile
//   og-image.png             1200×630 social-card
//   safari-pinned-tab.svg    Safari macOS pinned-tab mono SVG

import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const pub = join(root, 'public');
const SOURCE_SVG = join(pub, 'icon.svg');
const svgBuffer = await readFile(SOURCE_SVG);

async function writePng(file, size) {
  const buf = await sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png()
    .toBuffer();
  await writeFile(join(pub, file), buf);
  console.log(`  wrote public/${file}  (${size}×${size})`);
}

async function writeMaskable(file, size, padPct = 0.16) {
  const inner = Math.round(size * (1 - padPct * 2));
  const offset = Math.round((size - inner) / 2);
  const bg = await sharp({
    create: {
      width: size, height: size, channels: 4,
      background: { r: 0x0A, g: 0x36, b: 0x9D, alpha: 1 },
    },
  }).png().toBuffer();
  const innerIcon = await sharp(svgBuffer, { density: 384 })
    .resize(inner, inner, { fit: 'contain' })
    .png()
    .toBuffer();
  const composite = await sharp(bg)
    .composite([{ input: innerIcon, top: offset, left: offset }])
    .png()
    .toBuffer();
  await writeFile(join(pub, file), composite);
  console.log(`  wrote public/${file}  (${size}×${size}, maskable)`);
}

async function writeOg(file, w = 1200, h = 630) {
  const bg = await sharp({
    create: {
      width: w, height: h, channels: 4,
      background: { r: 0x0A, g: 0x36, b: 0x9D, alpha: 1 },
    },
  }).png().toBuffer();
  const iconSize = 320;
  const iconBuf = await sharp(svgBuffer, { density: 384 })
    .resize(iconSize, iconSize, { fit: 'contain' })
    .png()
    .toBuffer();
  const labelSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w - iconSize - 240}" height="${h}">
      <style>
        .title { font: 700 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #fff }
        .tagline { font: 400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: rgba(255,255,255,0.85) }
      </style>
      <text x="0" y="${h / 2 - 16}" class="title">Biblical Evidence</text>
      <text x="0" y="${h / 2 + 24}" class="title">Archive</text>
      <text x="0" y="${h / 2 + 88}" class="tagline">Archaeology · Manuscripts · Science</text>
    </svg>
  `;
  const composite = await sharp(bg)
    .composite([
      { input: iconBuf, top: Math.round((h - iconSize) / 2), left: 120 },
      { input: Buffer.from(labelSvg), top: 0, left: iconSize + 200 },
    ])
    .png()
    .toBuffer();
  await writeFile(join(pub, file), composite);
  console.log(`  wrote public/${file}  (${w}×${h}, OG)`);
}

async function writeFavicon() {
  const size48 = await sharp(svgBuffer, { density: 384 })
    .resize(48, 48, { fit: 'contain' })
    .png()
    .toBuffer();
  await writeFile(join(pub, 'favicon.ico'), size48);
  console.log('  wrote public/favicon.ico  (48×48 PNG-ICO)');
}

async function writeSafariPinned() {
  const src = await readFile(SOURCE_SVG, 'utf-8');
  const mono = src
    .replace(/<defs>[\s\S]*?<\/defs>/, '')
    .replace(/url\(#[^)]+\)/g, '#000')
    .replace(/stroke="rgba\([^)]+\)"/g, 'stroke="#000"')
    .replace(/fill="rgba\([^)]+\)"/g, 'fill="#000"');
  await writeFile(join(pub, 'safari-pinned-tab.svg'), mono);
  console.log('  wrote public/safari-pinned-tab.svg  (mono)');
}

console.log('Generating icon set from public/icon.svg…');
await writePng('favicon-16x16.png', 16);
await writePng('favicon-32x32.png', 32);
await writePng('favicon.png', 32); // legacy alias
await writeFavicon();
await writePng('apple-touch-icon.png', 180);
await writePng('pwa-192x192.png', 192);
await writePng('pwa-512x512.png', 512);
await writeMaskable('pwa-maskable-512x512.png', 512);
await writePng('mstile-150x150.png', 150);
await writeOg('og-image.png');
await writeSafariPinned();
console.log('Done.');
