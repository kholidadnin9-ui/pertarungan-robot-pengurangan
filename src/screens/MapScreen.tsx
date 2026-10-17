import { motion } from "framer-motion";
import { ChunkyButton, IconButton, Plate, SoundIcon, Stars } from "../ui";
import { ARENA_IMG, LEVELS, TOTAL_QUESTIONS, type Fighter, type ProgressMap } from "../data";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

function Contender({ f, flip, tag }: { f: Fighter; flip: boolean; tag: string }) {
  return (
    <motion.div
      initial={{ x: flip ? 80 : -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="flex min-w-0 flex-1 flex-col items-center"
    >
      <div className="relative aspect-[1.1] w-full max-w-[300px]">
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 60%, ${f.beamGlow}55, transparent 62%)` }} />
        <div className="absolute inset-x-[16%] bottom-[2%] h-[9%] rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(3,10,30,.7), transparent)" }} />
        <img
          src={f.sprite}
          alt={f.nama}
          className="fighter-bob relative h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,.5)]"
          style={{ transform: flip === f.meta.facesRight ? "scaleX(-1)" : undefined }}
          draggable={false}
        />
      </div>
      <div className="label mt-1 text-[10px]" style={{ color: f.face }}>
        {tag}
      </div>
      <div className="truncate font-game text-base text-white sm:text-xl">{f.nama}</div>
      <div className="text-[11px] font-bold text-ice/75">Jurus: {f.jurus}</div>
    </motion.div>
  );
}

export default function MapScreen({
  levelId,
  progress,
  fighters,
  mode,
  onPlay,
  onBack,
  onToggleSound,
  soundOn,
}: {
  levelId: number;
  progress: ProgressMap;
  fighters: [Fighter, Fighter];
  mode: 1 | 2;
  onPlay: () => void;
  onBack: () => void;
  onToggleSound: () => void;
  soundOn: boolean;
}) {
  const lv = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];
  const rounds = progress[lv.id]?.rounds ?? [];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img src={ARENA_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,46,.78),rgba(8,18,46,.95))]" />
      <div className="absolute inset-0 grid-lines opacity-45" />

      <div className="absolute left-4 top-4 z-30">
        <IconButton label="Kembali" onClick={onBack}>
          <BackIcon />
        </IconButton>
      </div>
      <div className="absolute right-4 top-4 z-30">
        <IconButton label="Suara" onClick={onToggleSound}>
          <SoundIcon on={soundOn} />
        </IconButton>
      </div>

      <div className="relative z-20 mx-auto w-full max-w-5xl px-5 pb-14 pt-16">
        <Plate className="mx-auto max-w-lg px-8 py-3 text-center">
          <h2 className="sticker sticker-sm" style={{ fontSize: "clamp(1.5rem,4.2vw,2.35rem)", color: "#FFE27A" }}>
            {lv.nama}
          </h2>
          <div className="label mt-1 text-[10px] text-glow">{lv.sub}</div>
        </Plate>

        {/* pertandingan */}
        <div className="mt-6 flex items-center justify-between gap-2 sm:gap-6">
          <Contender f={fighters[0]} flip={false} tag={mode === 1 ? "Kamu" : "Pemain 1"} />
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 12 }}
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-4 border-[#7E1010] bg-gradient-to-b from-[#FF7B7B] to-[#C41E1E] shadow-[0_10px_26px_rgba(0,0,0,.5)] sm:h-20 sm:w-20"
          >
            <span className="font-game text-2xl text-white sm:text-3xl" style={{ textShadow: "0 3px 0 #4a0612" }}>
              VS
            </span>
          </motion.div>
          <Contender f={fighters[1]} flip tag={mode === 1 ? "Musuh" : "Pemain 2"} />
        </div>

        <p className="mx-auto mt-6 max-w-xl rounded-full bg-arena-950/70 px-5 py-2 text-center text-xs font-bold text-ice/85 sm:text-sm">
          Jawab secepat mungkin untuk menembakkan laser! Menang = serangan pamungkas!
        </p>

        {mode === 1 && (
          <div className="mt-6">
            <div className="label mb-3 text-center text-[10px] text-ice/70">Rekor kecepatan per soal</div>
            <div className="grid grid-cols-5 gap-x-3 gap-y-5 sm:grid-cols-10">
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
                const s = rounds[i] ?? 0;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="hex grid h-[56px] w-[52px] place-items-center"
                      style={{
                        background: s > 0 ? "linear-gradient(180deg,#FFD24A,#E08600)" : `linear-gradient(180deg, ${lv.face}, ${lv.deep})`,
                        boxShadow: "inset 0 -8px 14px rgba(0,0,0,.32), inset 0 4px 0 rgba(255,255,255,.4)",
                      }}
                    >
                      <span className="tabnum font-game text-xl text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,.35)" }}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Stars count={s} size={13} dim="#2C3B63" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ChunkyButton tone="blue" onClick={onBack}>
            ← Pilih Level
          </ChunkyButton>
          <ChunkyButton tone="cta" size="lg" onClick={onPlay} className="anim-pulse">
            SIAP BERTARUNG ▶
          </ChunkyButton>
        </div>
      </div>
    </div>
  );
}
