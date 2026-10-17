// Pipeline aset: hapus latar chroma-key, despill, crop, deteksi moncong meriam,
// buat varian warna (hijau & monster), ekspor WebP + metadata + lembar kontak.
import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire("/tmp/imgtools/package.json");
const sharp = require("sharp");

const ROOT = process.cwd();
const RAW = path.join(ROOT, "raw");
const OUT = path.join(ROOT, "src/assets");
fs.mkdirSync(OUT, { recursive: true });

const RECIPES = [
  { id: "kuning", src: "robot-kuning.png" },
  { id: "biru", src: "robot-biru.png" },
  { id: "pink", src: "robot-pink.png" },
  { id: "hijau", src: "robot-pink.png", recolor: "green" },
  { id: "monster", src: "robot-kuning.png", recolor: "monster", scale: 1.14 },
];

/* ---------------- warna ---------------- */
function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, mx ? d / mx : 0, mx];
}
function hsv2rgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
const inHue = (h, lo, hi) => (lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi);
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ---------------- key-out ---------------- */
async function keyOut(file) {
  const { data, info } = await sharp(path.join(RAW, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const rs = [], gs = [], bs = [];
  const sample = (x, y) => { const i = (y * W + x) * 4; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); };
  for (let x = 0; x < W; x += 3) { sample(x, 1); sample(x, H - 2); }
  for (let y = 0; y < H; y += 3) { sample(1, y); sample(W - 2, y); }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  const bg = [med(rs), med(gs), med(bs)];
  const green = bg[1] > bg[0] && bg[1] > bg[2];
  const keyOf = (r, g, b) => (green ? g - Math.max(r, b) : Math.min(r, b) - g);
  const kbg = Math.max(60, keyOf(...bg));
  const T0 = kbg * 0.22, T1 = kbg * 0.55;

  const px = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    let r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const k = keyOf(r, g, b);
    let a = 1 - smooth(T0, T1, k);
    if (green) { const m = Math.max(r, b); if (g > m) g = m; }
    else { const m = Math.min(r, b); if (m > g) { r -= m - g; b -= m - g; } }
    if (a < 0.06) a = 0;
    px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b; px[i * 4 + 3] = Math.round(a * 255);
  }

  // hanya komponen terbesar yang dipertahankan (buang bintik)
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = px[i * 4 + 3] > 40 ? 1 : 0;
  const label = new Int32Array(W * H).fill(-1);
  let best = -1, bestSize = 0, n = 0;
  const stack = [];
  for (let i = 0; i < W * H; i++) {
    if (!solid[i] || label[i] !== -1) continue;
    let size = 0; stack.push(i); label[i] = n;
    while (stack.length) {
      const j = stack.pop(); size++;
      const x = j % W, y = (j / W) | 0;
      const nb = [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1];
      for (const q of nb) if (q >= 0 && solid[q] && label[q] === -1) { label[q] = n; stack.push(q); }
    }
    if (size > bestSize) { bestSize = size; best = n; }
    n++;
  }
  for (let i = 0; i < W * H; i++) if (solid[i] && label[i] !== best) px[i * 4 + 3] = 0;
  return { px, W, H, bg, green };
}

/* ---------------- recolor ---------------- */
function recolor(px, mode) {
  const out = Buffer.from(px);
  for (let i = 0; i < out.length; i += 4) {
    if (!out[i + 3]) continue;
    const [h, s, v] = rgb2hsv(out[i], out[i + 1], out[i + 2]);
    let rgb = null;
    if (mode === "green") {
      if (s > 0.18 && inHue(h, 280, 20)) rgb = hsv2rgb(h + 175, Math.min(1, s * 1.05), v * 0.96);
      else if (s > 0.18 && inHue(h, 22, 75)) rgb = hsv2rgb(h + 92, Math.min(1, s * 1.05), v * 0.95);
    } else if (mode === "monster") {
      const glow = s > 0.3 && v > 0.5 && inHue(h, 160, 245);
      if (glow) rgb = hsv2rgb(352, Math.max(0.85, s), Math.min(1, v * 1.1));
      else rgb = hsv2rgb(266, 0.14 + 0.12 * s, 0.045 + 0.36 * Math.pow(v, 1.4));
    }
    if (rgb) { out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; }
  }
  return out;
}

/* ---------------- crop + meta ---------------- */
function analyse(px, W, H) {
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (px[(y * W + x) * 4 + 3] > 127) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const A = (x, y) => px[((y0 + y) * W + (x0 + x)) * 4 + 3];

  let xmax = 0;
  const rowMax = [];
  for (let y = Math.round(ch * 0.15); y < Math.round(ch * 0.75); y++) {
    let m = -1;
    for (let x = cw - 1; x >= 0; x--) if (A(x, y) > 160) { m = x; break; }
    rowMax.push([y, m]);
    if (m > xmax) xmax = m;
  }
  const ys = rowMax.filter(([, m]) => m >= xmax - cw * 0.015).map(([y]) => y).sort((a, b) => a - b);
  const my = ys[ys.length >> 1] ?? ch * 0.4;

  let sx = 0, cnt = 0;
  for (let y = Math.round(ch * 0.62); y < Math.round(ch * 0.92); y++) for (let x = 0; x < cw; x++) if (A(x, y) > 160) { sx += x; cnt++; }
  const cx = cnt ? sx / cnt : cw / 2;

  let headY = 0;
  for (let y = 0; y < ch; y++) { let c = 0; for (let x = 0; x < cw; x++) if (A(x, y) > 160) c++; if (c > cw * 0.04) { headY = y; break; } }
  let hx = 0, hc = 0;
  for (let y = headY; y < Math.min(ch, headY + Math.round(ch * 0.08)); y++) for (let x = 0; x < cw; x++) if (A(x, y) > 160) { hx += x; hc++; }
  const headX = hc ? hx / hc : cx;

  return {
    crop: { left: x0, top: y0, width: cw, height: ch },
    meta: {
      aspect: +(cw / ch).toFixed(4),
      muzzle: { x: +((xmax - cw * 0.004) / cw).toFixed(3), y: +(my / ch).toFixed(3) },
      core: { x: +(cx / cw).toFixed(3), y: 0.4 },
      head: { x: +(headX / cw).toFixed(3), y: +((headY + ch * 0.06) / ch).toFixed(3) },
    },
  };
}

/* ---------------- run ---------------- */
const cache = {};
const metas = {};

for (const r of RECIPES) {
  if (!cache[r.src]) cache[r.src] = await keyOut(r.src);
  const { px, W, H, bg, green } = cache[r.src];
  const pixels = r.recolor ? recolor(px, r.recolor) : px;
  const { crop, meta } = analyse(pixels, W, H);
  meta.facesRight = true;
  meta.scale = r.scale ?? 1;
  metas[r.id] = meta;

  const outH = Math.min(720, crop.height);
  await sharp(pixels, { raw: { width: W, height: H, channels: 4 } })
    .extract(crop)
    .resize({ height: outH })
    .webp({ quality: 84, alphaQuality: 92, effort: 5 })
    .toFile(path.join(OUT, `sprite-${r.id}.webp`));
  console.log(r.id, `bg=${bg} ${green ? "green" : "magenta"}`, JSON.stringify(meta));
}

for (const name of ["hero", "arena"]) {
  const src = path.join(ROOT, "public/images", `${name}.jpg`);
  if (fs.existsSync(src)) {
    await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 74, effort: 5 }).toFile(path.join(OUT, `${name}.webp`));
  }
}

fs.writeFileSync(
  path.join(ROOT, "src/spriteMeta.ts"),
  `// Dihasilkan otomatis oleh raw/process.mjs — posisi relatif terhadap kotak sprite (0..1)\n` +
    `export interface SpriteMeta {\n  aspect: number;\n  facesRight: boolean;\n  scale: number;\n  muzzle: { x: number; y: number };\n  core: { x: number; y: number };\n  head: { x: number; y: number };\n}\n\n` +
    `export const SPRITE_META: Record<string, SpriteMeta> = ${JSON.stringify(metas, null, 2)};\n`
);
console.log("assets:", fs.readdirSync(OUT).join(", "));
