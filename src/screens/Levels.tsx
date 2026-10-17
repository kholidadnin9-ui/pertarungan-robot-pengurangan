import { motion } from "framer-motion";
import { ChunkyButton, IconButton, HomeIcon, Plate, SoundIcon, Stars } from "../ui";
import { ARENA_IMG, LEVELS, type ProgressMap } from "../data";

export default function Levels({
  progress,
  onPick,
  onHome,
  onToggleSound,
  soundOn,
}: {
  progress: ProgressMap;
  onPick: (id: number) => void;
  onHome: () => void;
  onToggleSound: () => void;
  soundOn: boolean;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img src={ARENA_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,46,.8),rgba(8,18,46,.95))]" />
      <div className="absolute inset-0 grid-lines opacity-40" />

      <div className="absolute left-4 top-4 z-30">
        <IconButton label="Beranda" onClick={onHome}>
          <HomeIcon />
        </IconButton>
      </div>
      <div className="absolute right-4 top-4 z-30">
        <IconButton label="Suara" onClick={onToggleSound}>
          <SoundIcon on={soundOn} />
        </IconButton>
      </div>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 pb-14 pt-16">
        <Plate className="mx-auto max-w-2xl px-8 py-3 text-center">
          <h2 className="sticker sticker-sm" style={{ fontSize: "clamp(1.55rem,4.4vw,2.55rem)" }}>
            PILIH LEVEL
          </h2>
        </Plate>
        <p className="mx-auto mt-3 max-w-xl rounded-full bg-arena-950/70 px-5 py-2 text-center text-sm font-bold text-ice/85">
          Selesaikan setiap level untuk melawan Robot Monster!
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {LEVELS.map((lv, i) => {
            const best = progress[lv.id]?.bestStars ?? 0;
            return (
              <motion.div
                key={lv.id}
                initial={{ y: 26, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.07 * i, type: "spring", stiffness: 150, damping: 18 }}
                className="relative flex flex-col rounded-[26px] border-b-[8px] bg-gradient-to-b from-[#20407F] to-[#0C1D45] p-3"
                style={{ borderColor: lv.lip, boxShadow: `0 18px 36px rgba(3,10,30,.5), inset 0 2px 0 rgba(255,255,255,.22)` }}
              >
                <div className="rounded-[16px] border-b-[5px] px-3 py-2 text-center" style={{ background: `linear-gradient(180deg, ${lv.face}, ${lv.deep})`, borderColor: lv.lip }}>
                  <span className="font-game text-lg text-white drop-shadow-[0_2px_0_rgba(0,0,0,.35)]">{lv.nama}</span>
                </div>

                <div
                  className="relative mt-3 h-36 overflow-hidden rounded-[18px] border-2 border-white/15"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${lv.face}66, #0B1B3A 72%)` }}
                >
                  <img
                    src={lv.img}
                    alt=""
                    className="absolute inset-x-0 bottom-0 h-[118%] w-full object-contain object-bottom drop-shadow-[0_8px_10px_rgba(0,0,0,.5)]"
                    style={lv.id === 5 ? { transform: "scaleX(-1)" } : undefined}
                    draggable={false}
                  />
                </div>

                <div className="mt-3">
                  <Stars count={best} size={26} />
                </div>

                <div className="mt-3 rounded-xl bg-arena-950/55 px-2 py-2 text-center">
                  <div className="label text-[10px] text-ice/70">Pengurangan</div>
                  <div className="tabnum font-game text-lg text-white">{lv.sub.replace("Pengurangan ", "")}</div>
                  <div className="mt-1 text-[10px] font-bold text-ice/60">10 soal · 3 pilihan</div>
                </div>

                <div className="mt-4">
                  <ChunkyButton tone="cta" size="sm" onClick={() => onPick(lv.id)} className="w-full">
                    Mulai
                  </ChunkyButton>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
