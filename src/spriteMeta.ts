// Dihasilkan otomatis oleh raw/process.mjs — posisi relatif terhadap kotak sprite (0..1)
export interface SpriteMeta {
  aspect: number;
  facesRight: boolean;
  scale: number;
  muzzle: { x: number; y: number };
  core: { x: number; y: number };
  head: { x: number; y: number };
}

export const SPRITE_META: Record<string, SpriteMeta> = {
  "kuning": {
    "aspect": 1.0058,
    "muzzle": {
      "x": 0.976,
      "y": 0.191
    },
    "core": {
      "x": 0.421,
      "y": 0.4
    },
    "head": {
      "x": 0.534,
      "y": 0.098
    },
    "facesRight": true,
    "scale": 1
  },
  "biru": {
    "aspect": 1.0321,
    "muzzle": {
      "x": 0.976,
      "y": 0.241
    },
    "core": {
      "x": 0.387,
      "y": 0.4
    },
    "head": {
      "x": 0.345,
      "y": 0.11
    },
    "facesRight": true,
    "scale": 1
  },
  "pink": {
    "aspect": 1.1623,
    "muzzle": {
      "x": 0.976,
      "y": 0.236
    },
    "core": {
      "x": 0.36,
      "y": 0.4
    },
    "head": {
      "x": 0.354,
      "y": 0.106
    },
    "facesRight": true,
    "scale": 1
  },
  "hijau": {
    "aspect": 1.1623,
    "muzzle": {
      "x": 0.976,
      "y": 0.236
    },
    "core": {
      "x": 0.36,
      "y": 0.4
    },
    "head": {
      "x": 0.354,
      "y": 0.106
    },
    "facesRight": true,
    "scale": 1
  },
  "monster": {
    "aspect": 1.0058,
    "muzzle": {
      "x": 0.976,
      "y": 0.191
    },
    "core": {
      "x": 0.421,
      "y": 0.4
    },
    "head": {
      "x": 0.534,
      "y": 0.098
    },
    "facesRight": true,
    "scale": 1.14
  }
};
