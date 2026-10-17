// Semua gambar diimpor lewat bundler supaya ikut ter-inline ke dalam satu file HTML.
import hero from "./assets/hero.webp";
import arena from "./assets/arena.webp";
import kuning from "./assets/sprite-kuning.webp";
import biru from "./assets/sprite-biru.webp";
import pink from "./assets/sprite-pink.webp";
import hijau from "./assets/sprite-hijau.webp";
import monster from "./assets/sprite-monster.webp";

export const ART = {
  hero,
  arena,
  sprite: { kuning, biru, pink, hijau, monster },
};
