import { motion } from "framer-motion";
import { ChunkyButton, HomeIcon, IconButton, Plate, SoundIcon } from "../ui";
import { ARENA_IMG, MONSTER, ROBOTS, type Fighter, type RobotId } from "../data";

function RobotPortrait({ r, size = "md" }: { r: Fighter; size?: "md" | "sm" }) {
  return (
    <div className={`relative mx-auto aspect-[1.1] w-full ${size === "md" ? "max-w-[190px]" : "max-w-[120px]"}`}>
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 58%, ${r.beamGlow}55, transparent 64%)` }} />
      <div className="absolute inset-x-[18%] bottom-[2%] h-[10%] rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(3,10,30,.65), transparent)" }} />
      <img src={r.sprite} alt={r.nama} className="relative h-full w-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,.45)]" draggable={false} />
    </div>
  );
}

export default function Setup({
  mode,
  setMode,
  picks,
  setPicks,
  onConfirm,
  onHome,
  onToggleSound,
  soundOn,
}: {
  mode: 1 | 2;
  setMode: (m: 1 | 2) => void;
  picks: RobotId[];
  setPicks: (p: RobotId[]) => void;
  onConfirm: () => void;
  onHome: () => void;
  onToggleSound: () => void;
  soundOn: boolean;
}) {
  const players = mode === 1 ? 1 : 2;

  const choose = (p: number, id: RobotId) => {
    const next = [...picks] as RobotId[];
    next[p] = id;
    // kedua pemain harus memakai robot yang berbeda
    if (mode === 2 && next[0] === next[1]) {
      const o = p === 0 ? 1 : 0;
      next[o] = (ROBOTS.find((r) => r.id !== id)?.id ?? "biru") as RobotId;
    }
    setPicks(next);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img src={ARENA_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,46,.82),rgba(8,18,46,.94))]" />
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

      <div className="relative z-20 mx-auto w-full max-w-6xl px-5 pb-14 pt-20">
        <div className="text-center">
          <h2 className="sticker" style={{ fontSize: "clamp(1.75rem,5vw,3.1rem)" }}>
            PILIH ROBOTMU
          </h2>
          <p className="mt-2 text-sm font-bold text-ice/85 md:text-base">Tentukan jumlah pemain, lalu ketuk robot untuk memilih jagoanmu!</p>
        </div>

        {/* Jumlah pemain */}
        <div className="mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-4">
          {([1, 2] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative rounded-[22px] border-b-[6px] px-5 py-5 text-left transition-all ${
                  active
                    ? "border-[#B24A00] bg-gradient-to-b from-[#FFC24A] to-[#FF7A0F] shadow-[0_16px_30px_rgba(255,150,30,.32)]"
                    : "border-[#0B3E8F] bg-gradient-to-b from-[#2C4E9E] to-[#12275C] hover:brightness-110"
                }`}
              >
                <div className="label text-[10px] text-white/80">Mode</div>
                <div className="font-game text-xl text-white sm:text-2xl">{m} PEMAIN</div>
                <div className="mt-1 text-xs font-bold text-white/90">{m === 1 ? "Lawan Robot Monster" : "Duel Seru dengan Teman"}</div>
                {active && (
                  <motion.span layoutId="mode-check" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white font-black text-[#B24A00]">
                    ✓
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pilihan robot */}
        {Array.from({ length: players }).map((_, p) => (
          <div key={p} className="mt-10">
            <Plate className="mx-auto max-w-md px-6 py-2.5 text-center">
              <span className="label text-xs text-glow">{mode === 1 ? "Pilih Robot Kamu" : p === 0 ? "Pemain 1, ketuk robot pilihanmu" : "Pemain 2, sekarang giliranmu memilih!"}</span>
            </Plate>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {ROBOTS.map((r) => {
                const id = r.id as RobotId;
                const active = picks[p] === id;
                const takenByP1 = mode === 2 && p === 1 && picks[0] === id;
                return (
                  <motion.button
                    key={r.id}
                    whileHover={takenByP1 ? undefined : { y: -6 }}
                    whileTap={takenByP1 ? undefined : { scale: 0.96 }}
                    disabled={takenByP1}
                    onClick={() => choose(p, id)}
                    className={`relative rounded-[24px] border-b-[6px] p-3 text-center transition-all ${
                      active ? "border-white/70 bg-gradient-to-b from-[#1D3B7C] to-[#0B1B3A]" : "border-[#08122E] bg-gradient-to-b from-[#16295C] to-[#0B1B3A] hover:brightness-110"
                    } ${takenByP1 ? "cursor-not-allowed opacity-45" : ""}`}
                    style={active ? { boxShadow: `0 0 0 3px ${r.face}, 0 18px 36px rgba(0,0,0,.45)` } : undefined}
                  >
                    <RobotPortrait r={r} />
                    <div className="mt-2 font-game text-sm text-white sm:text-base">{r.nama}</div>
                    <div className="text-[11px] font-bold text-ice/80">
                      Jurus: <span style={{ color: r.face }}>{r.jurus}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold italic text-ice/55">{takenByP1 ? "Sudah dipilih Pemain 1" : r.tagline}</div>
                    {active && (
                      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full font-black text-[#0B1B3A]" style={{ background: r.face }}>
                        ✓
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {mode === 1 && (
          <div className="mx-auto mt-8 flex max-w-md items-center gap-4 rounded-[22px] border-2 border-[#FF4B6E]/40 bg-[#2A0A18]/70 px-4 py-3">
            <div className="w-24 shrink-0" style={{ transform: "scaleX(-1)" }}>
              <RobotPortrait r={MONSTER} size="sm" />
            </div>
            <div className="text-left">
              <div className="label text-[10px] text-[#FF9DB0]">Lawanmu</div>
              <div className="font-game text-lg text-white">{MONSTER.nama}</div>
              <div className="text-xs font-bold text-ice/80">Jurus: {MONSTER.jurus} · Kalahkan dengan menjawab lebih cepat!</div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <ChunkyButton tone="green" size="lg" onClick={onConfirm} className="min-w-[240px]">
            LANJUT ▶
          </ChunkyButton>
        </div>
      </div>
    </div>
  );
}
