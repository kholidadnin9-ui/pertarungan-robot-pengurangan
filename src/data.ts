import { ART } from "./art";
import { SPRITE_META, type SpriteMeta } from "./spriteMeta";

export type RobotId = "kuning" | "biru" | "pink" | "hijau";
export type FighterId = RobotId | "monster";

export interface Fighter {
  id: FighterId;
  nama: string;
  label: string;
  jurus: string;
  tagline: string;
  sprite: string;
  meta: SpriteMeta;
  face: string;
  deep: string;
  lip: string;
  glow: string;
  /** warna inti laser */
  beam: string;
  /** warna pendar laser */
  beamGlow: string;
}

export type Robot = Fighter;

const meta = (id: FighterId, patch: Partial<SpriteMeta> = {}): SpriteMeta => ({ ...SPRITE_META[id], ...patch });

export const ROBOTS: Fighter[] = [
  {
    id: "kuning",
    nama: "TITAN KUNING",
    label: "KUNING",
    jurus: "Meriam Petir",
    tagline: "Kuat seperti baja!",
    sprite: ART.sprite.kuning,
    meta: meta("kuning", { head: { x: 0.37, y: 0.08 } }),
    face: "#FFD24A",
    deep: "#E08A00",
    lip: "#A65C00",
    glow: "#FFE9A8",
    beam: "#FFE680",
    beamGlow: "#FF9A1F",
  },
  {
    id: "biru",
    nama: "BADAI BIRU",
    label: "BIRU",
    jurus: "Laser Badai",
    tagline: "Secepat badai petir!",
    sprite: ART.sprite.biru,
    meta: meta("biru"),
    face: "#5EC2FF",
    deep: "#1667D6",
    lip: "#0B3E8F",
    glow: "#BFE9FF",
    beam: "#B5F3FF",
    beamGlow: "#1E90FF",
  },
  {
    id: "pink",
    nama: "NOVA PINK",
    label: "PINK",
    jurus: "Plasma Bintang",
    tagline: "Bersinar bagai bintang!",
    sprite: ART.sprite.pink,
    meta: meta("pink"),
    face: "#FF86C8",
    deep: "#D6277F",
    lip: "#8E1252",
    glow: "#FFD1E9",
    beam: "#FFC6EC",
    beamGlow: "#FF2EA6",
  },
  {
    id: "hijau",
    nama: "VIPER HIJAU",
    label: "HIJAU",
    jurus: "Sinar Zamrud",
    tagline: "Gesit dan pantang menyerah!",
    sprite: ART.sprite.hijau,
    meta: meta("hijau"),
    face: "#7FE05C",
    deep: "#2E9E22",
    lip: "#1A6B12",
    glow: "#D2FFB8",
    beam: "#DDFFB0",
    beamGlow: "#22C55E",
  },
];

export const MONSTER: Fighter = {
  id: "monster",
  nama: "ROBOT MONSTER",
  label: "MONSTER",
  jurus: "Sinar Kegelapan",
  tagline: "Penguasa angka gelap!",
  sprite: ART.sprite.monster,
  meta: meta("monster", { head: { x: 0.37, y: 0.075 } }),
  face: "#FF4B6E",
  deep: "#A3133A",
  lip: "#4A0A1C",
  glow: "#FFC1CF",
  beam: "#FFA3B5",
  beamGlow: "#E0115F",
};

export function robotById(id: RobotId): Fighter {
  return ROBOTS.find((r) => r.id === id) ?? ROBOTS[0];
}

export const HERO_IMG = ART.hero;
export const ARENA_IMG = ART.arena;
export const MONSTER_IMG = ART.sprite.monster;

/* ------------------------------------------------------------------ */
/*  Level                                                              */
/* ------------------------------------------------------------------ */

export interface LevelDef {
  id: number;
  nama: string;
  sub: string;
  /** rentang bilangan pertama (yang dikurangi) */
  band: [number, number];
  /** batas bilangan pengurang */
  bMax: number;
  face: string;
  deep: string;
  lip: string;
  glow: string;
  img: string;
  /** waktu berpikir Robot Monster (detik) */
  monsterTime: [number, number];
  /** peluang Robot Monster salah menjawab */
  monsterMiss: number;
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    nama: "LEVEL 1",
    sub: "Pengurangan 1 - 10",
    band: [2, 10],
    bMax: 9,
    face: "#FFC24A",
    deep: "#C06A00",
    lip: "#7E4100",
    glow: "#FFE9A8",
    img: ART.sprite.kuning,
    monsterTime: [8.5, 12.5],
    monsterMiss: 0.3,
  },
  {
    id: 2,
    nama: "LEVEL 2",
    sub: "Pengurangan 11 - 20",
    band: [11, 20],
    bMax: 10,
    face: "#5EC2FF",
    deep: "#1667D6",
    lip: "#0B3E8F",
    glow: "#BFE9FF",
    img: ART.sprite.biru,
    monsterTime: [9, 13],
    monsterMiss: 0.27,
  },
  {
    id: 3,
    nama: "LEVEL 3",
    sub: "Pengurangan 21 - 50",
    band: [21, 50],
    bMax: 30,
    face: "#FF6B6B",
    deep: "#C41E1E",
    lip: "#7E1010",
    glow: "#FFC9C9",
    img: ART.sprite.pink,
    monsterTime: [10, 14],
    monsterMiss: 0.24,
  },
  {
    id: 4,
    nama: "LEVEL 4",
    sub: "Pengurangan 51 - 75",
    band: [51, 75],
    bMax: 45,
    face: "#B98CFF",
    deep: "#5B2BA8",
    lip: "#381A6B",
    glow: "#E2D2FF",
    img: ART.sprite.hijau,
    monsterTime: [10.5, 14.5],
    monsterMiss: 0.2,
  },
  {
    id: 5,
    nama: "LEVEL 5",
    sub: "Pengurangan 76 - 100",
    band: [76, 100],
    bMax: 60,
    face: "#FF9A1F",
    deep: "#C25400",
    lip: "#7E3600",
    glow: "#FFD9A8",
    img: ART.sprite.monster,
    monsterTime: [11, 15],
    monsterMiss: 0.16,
  },
];

export const TOTAL_QUESTIONS = 10;

/* ------------------------------------------------------------------ */
/*  Soal                                                               */
/* ------------------------------------------------------------------ */

export interface Question {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Soal pengurangan a − b dengan 3 opsi: 1 benar + 2 pengecoh yang mirip. */
export function makeQuestion(level: LevelDef): Question {
  const [lo, hi] = level.band;
  const a = rnd(lo, hi);
  const b = rnd(1, Math.max(1, Math.min(level.bMax, a - 1)));
  const answer = a - b;

  // level atas: pengecoh ±10 meniru kesalahan meminjam/nilai tempat
  const near = level.id <= 2 ? [-1, 1, -2, 2, -3, 3] : [-1, 1, -2, 2, -10, 10, -9, 9, -11, 11];
  const options = new Set<number>([answer]);
  for (const d of shuffle(near)) {
    if (options.size >= 3) break;
    const v = answer + d;
    if (v >= 0 && v <= 100) options.add(v);
  }
  let g = 1;
  while (options.size < 3) options.add(answer + g++);

  return { a, b, answer, options: shuffle([...options]) };
}

/* ------------------------------------------------------------------ */
/*  Penilaian                                                          */
/* ------------------------------------------------------------------ */

export function starsFor(hits: number): number {
  if (hits >= 9) return 3;
  if (hits >= 6) return 2;
  return 1;
}

/** bintang per soal berdasarkan kecepatan menjawab (detik) */
export function roundStarFor(seconds: number): number {
  if (seconds <= 4) return 3;
  if (seconds <= 8) return 2;
  return 1;
}

export function rankFor(hits: number): string {
  if (hits >= 10) return "Jenderal";
  if (hits >= 8) return "Komandan";
  if (hits >= 6) return "Ksatria";
  if (hits >= 4) return "Petarung";
  return "Kadet";
}

/* ------------------------------------------------------------------ */
/*  Progres tersimpan                                                  */
/* ------------------------------------------------------------------ */

export interface Progress {
  bestStars: number;
  /** bintang terbaik per soal (0..3) */
  rounds: number[];
}

export type ProgressMap = Record<number, Progress>;

const KEY = "robot-matematika-progress-v2";

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function saveProgress(p: ProgressMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* mode privat: abaikan */
  }
}
