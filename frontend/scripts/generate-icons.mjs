// Génère les icônes PWA (PNG) à partir d'un logo SVG.
// Usage : node scripts/generate-icons.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

// Logo « Zéro Mensonge » : trophée blanc sur dégradé vert de la marque.
function logoSvg(size, { padding = 0, background = true } = {}) {
  const p = Math.round(size * padding);
  const inner = size - p * 2;
  const trophy = `
    <g transform="translate(${p},${p})">
      <g transform="translate(${inner * 0.5},${inner * 0.5})" stroke="#ffffff" stroke-width="${inner * 0.055}" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M ${-inner * 0.2} ${-inner * 0.28} H ${inner * 0.2} V ${-inner * 0.02} a ${inner * 0.2} ${inner * 0.2} 0 0 1 ${-inner * 0.4} 0 Z" fill="#ffffff"/>
        <path d="M ${-inner * 0.2} ${-inner * 0.24} h ${-inner * 0.12} a ${inner * 0.1} ${inner * 0.1} 0 0 0 ${inner * 0.1} ${inner * 0.14}"/>
        <path d="M ${inner * 0.2} ${-inner * 0.24} h ${inner * 0.12} a ${inner * 0.1} ${inner * 0.1} 0 0 1 ${-inner * 0.1} ${inner * 0.14}"/>
        <path d="M 0 ${inner * 0.18} v ${inner * 0.1}" />
        <path d="M ${-inner * 0.13} ${inner * 0.3} H ${inner * 0.13}" stroke-width="${inner * 0.07}"/>
      </g>
    </g>`;
  const bg = background
    ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#12b76a"/>
        <stop offset="1" stop-color="#027a48"/>
      </linearGradient>
    </defs>
    ${bg}
    ${trophy}
  </svg>`;
}

async function render(svg, out, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log('écrit', out);
}

await mkdir(iconsDir, { recursive: true });
await render(logoSvg(512), path.join(iconsDir, 'icon-192.png'), 192);
await render(logoSvg(512), path.join(iconsDir, 'icon-512.png'), 512);
// Icône maskable : ajoute une marge de sécurité pour Android.
await render(logoSvg(512, { padding: 0.14 }), path.join(iconsDir, 'maskable-512.png'), 512);
await render(logoSvg(512), path.join(iconsDir, 'apple-touch-icon.png'), 180);
await writeFile(path.join(publicDir, 'logo.svg'), logoSvg(512), 'utf8');
console.log('Terminé.');
