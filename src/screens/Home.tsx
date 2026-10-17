import { useState } from "react";
import { motion } from "framer-motion";
import { ChunkyButton, IconButton, PlayIcon, SoundIcon, GearIcon, Stars } from "../ui";
import { HERO_IMG } from "../data";

export default function Home({
  onStart,
  onToggleSound,
  soundOn,
  bestStars,
}: {
  onStart: () => void;
  onToggleSound: () => void;
  soundOn: boolean;
  bestStars: number;
}) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={HERO_IMG}
        alt="Arena pertarungan robot matematika"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_18%,rgba(20,60,140,.25),rgba(8,18,46,.88))]" />
      <div className="absolute inset-0 grid-lines opacity-45" />
      <div className="absolute inset-0 vignette" />

      {/* pojok kanan atas */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <IconButton label="Suara" onClick={onToggleSound}>
          <SoundIcon on={soundOn} />
        </IconButton>
        <IconButton label="Cara Bermain" onClick={() => setShowHelp(true)}>
          <GearIcon />
        </IconButton>
      </div>

      <div className="relative z-20 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 pb-12 pt-16 text-center">
        <motion.div
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-3 rounded-full border-2 border-glow/60 bg-arena-900/80 px-5 py-1.5"
        >
          <span className="label text-[11px] text-glow">Pertarungan</span>
        </motion.div>

        <motion.h1
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="flex flex-col items-center leading-[0.86]"
        >
          <span
            className="sticker sticker-gold"
            style={{ fontSize: "clamp(3rem,11vw,7.2rem)", WebkitTextStroke: "5px #0b1b3a" }}
          >
            ROBOT
          </span>
          <span
            className="sticker"
            style={{
              fontSize: "clamp(1.9rem,7vw,4.4rem)",
              color: "#8FE9FF",
              marginTop: "-0.06em",
            }}
          >
            MATEMATIKA
          </span>
        </motion.h1>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="my-2 grid h-16 w-16 place-items-center rounded-2xl border-4 border-[#7E1010] bg-gradient-to-b from-[#FF7B7B] to-[#C41E1E] shadow-[0_10px_26px_rgba(0,0,0,.5)]"
        >
          <span className="sticker sticker-sm" style={{ fontSize: "1.65rem" }}>
            VS
          </span>
        </motion.div>

        <h2 className="flex flex-col items-center leading-[0.9]">
          <span
            className="sticker"
            style={{ fontSize: "clamp(1.9rem,7vw,4.4rem)", color: "#FF9ED6" }}
          >
            ROBOT MONSTER
          </span>
          <span
            className="sticker"
            style={{ fontSize: "clamp(1.25rem,4.6vw,2.85rem)", color: "#8FE9FF" }}
          >
            MATEMATIKA
          </span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-3 rounded-full border border-white/15 bg-arena-950/60 px-4 py-1 text-[10px] font-extrabold tracking-[0.22em] text-ice/85 sm:text-[11px]"
        >
          Created by: Widodo Guru SD
        </motion.p>

        <motion.div
          initial={{ scaleX: 0.7, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="mt-5 rounded-xl border-b-[5px] border-[#B24A00] bg-gradient-to-b from-[#FFC24A] to-[#FF7A0F] px-7 py-2 shadow-[0_10px_22px_rgba(0,0,0,.42)]"
        >
          <span className="label text-sm text-white drop-shadow-[0_2px_0_rgba(126,65,0,.65)]">
            Pengurangan 1 - 100
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 160, damping: 15 }}
          className="mt-8"
        >
          <ChunkyButton tone="cta" size="lg" onClick={onStart} className="min-w-[260px] tracking-wide">
            <PlayIcon />
            MULAI
          </ChunkyButton>
        </motion.div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-arena-950/70 px-5 py-2">
            <span className="label text-[10px] text-ice/70">Bintang Terkumpul</span>
            <Stars count={Math.min(3, Math.max(0, Math.ceil(bestStars / 5)))} size={22} />
            <span className="tabnum text-xs font-extrabold text-gold">{bestStars}/15</span>
          </div>
        </div>
      </div>

      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 grid place-items-center bg-arena-950/85 p-5"
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ scale: 0.88, y: 22, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 210, damping: 18 }}
            className="plate w-full max-w-lg rounded-[26px] p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="sticker sticker-sm text-center" style={{ fontSize: "clamp(1.4rem,5vw,2rem)" }}>
              CARA BERMAIN
            </h3>

            <ul className="mt-5 space-y-3 text-left">
              {[
                ["1", "Jawab soal pengurangan secepat mungkin. Yang paling cepat menjawab benar menembakkan laser ke robot lawan!"],
                ["2", "Laser membuat lawan berasap lalu meledak (-10 HP). Setiap level berisi 10 soal dengan 3 pilihan jawaban."],
                ["3", "Pemenang melancarkan SERANGAN PAMUNGKAS: laser raksasa sampai robot lawan hangus dan hilang!"],
                ["4", "1 PEMAIN melawan Robot Monster. 2 PEMAIN: Pemain 1 tombol 1 2 3 (A S D), Pemain 2 tombol 8 9 0 (J K L)."],
              ].map(([n, text]) => (
                <li key={n} className="flex gap-3">
                  <span
                    className="tabnum grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(180deg,#6EC8FF,#1667D6)" }}
                  >
                    {n}
                  </span>
                  <span className="pt-1 text-sm font-bold leading-relaxed text-white/92">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-center">
              <ChunkyButton tone="green" onClick={() => setShowHelp(false)}>
                MENGERTI
              </ChunkyButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
