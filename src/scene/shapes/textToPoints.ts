import type { Rand } from './index';

/**
 * 5 — Échantillonne un texte (le pseudo) rendu dans un canvas 2D et renvoie n positions 3D.
 * On lit les pixels opaques du texte et on tire des points au hasard dedans.
 */
export function textToPoints(text: string, n: number, r: Rand, width = 17): Float32Array {
  const out = new Float32Array(n * 3);
  const W = 1024;
  const H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return out;

  // Taille de police adaptée à la longueur du texte.
  let size = 190;
  const font = (s: number) => `900 ${s}px "Orbitron Variable", "Orbitron", system-ui, sans-serif`;
  ctx.font = font(size);
  while (ctx.measureText(text).width > W * 0.92 && size > 40) {
    size -= 6;
    ctx.font = font(size);
  }
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
  if (pts.length === 0) return out;

  const textW = Math.min(W, ctx.measureText(text).width);
  const scale = width / textW;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(r() * (pts.length / 2)) * 2;
    out[i * 3] = (pts[k] - W / 2 + (r() - 0.5) * 2) * scale;
    out[i * 3 + 1] = -(pts[k + 1] - H / 2 + (r() - 0.5) * 2) * scale;
    out[i * 3 + 2] = (r() - 0.5) * 0.5;
  }
  return out;
}
