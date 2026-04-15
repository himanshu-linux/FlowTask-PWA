/**
 * gen-icons.mjs
 * Generates PWA PNG icons from public/favicon.svg using @resvg/resvg-js
 * Run: node scripts/gen-icons.mjs
 */

import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const svgPath = path.join(root, 'public', 'favicon.svg');
const svgData = fs.readFileSync(svgPath, 'utf-8');

const ICONS = [
  { file: 'icon-192.png',        size: 192 },
  { file: 'icon-512.png',        size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon.png',          size: 64  },
];

for (const { file, size } of ICONS) {
  const resvg = new Resvg(svgData, {
    fitTo: { mode: 'width', value: size },
  });
  const rendered = resvg.render();
  const pngBuffer = rendered.asPng();
  const outPath = path.join(root, 'public', file);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`✅  Generated ${file} (${size}×${size}px) → ${pngBuffer.length} bytes`);
}

console.log('\n🎉 All PWA icons generated from favicon.svg!');
