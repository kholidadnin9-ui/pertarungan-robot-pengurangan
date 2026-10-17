// Gambar diambil dari folder public/images agar sesuai dengan aset yang tersedia.
// BASE_URL membuat jalur tetap benar saat aplikasi dipasang di subpath GitHub Pages.
const imageUrl = (fileName: string) => `${import.meta.env.BASE_URL}images/${fileName}`;

export const ART = {
  hero: imageUrl("hero.jpg"),
  arena: imageUrl("arena.jpg"),
  sprite: {
    kuning: imageUrl("robot-kuning.jpg"),
    biru: imageUrl("robot-biru.jpg"),
    pink: imageUrl("robot-pink.jpg"),
    hijau: imageUrl("robot-hijau.jpg"),
    monster: imageUrl("monster.jpg"),
  },
};
