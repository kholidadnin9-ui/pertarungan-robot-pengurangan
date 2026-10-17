import React from "react";
import { motion } from "framer-motion";
import { play } from "./sound";

/* ------------------------------------------------------------------ */
/*  Tombol 3D ala panel arkade                                          */
/* ------------------------------------------------------------------ */

export type Tone = "cta" | "blue" | "green" | "red" | "purple" | "dark";

const TONES: Record<Tone, { face: string; deep: string; edge: string; lip: string }> = {
  cta: { face: "#FFC24A", deep: "#FF7A0F", edge: "#B24A00", lip: "#B24A00" },
  blue: { face: "#6EC8FF", deep: "#1667D6", edge: "#0B3E8F", lip: "#0B3E8F" },
  green: { face: "#8CE86A", deep: "#2E9E22", edge: "#1A6B12", lip: "#1A6B12" },
  red: { face: "#FF7B7B", deep: "#C41E1E", edge: "#7E1010", lip: "#7E1010" },
  purple: { face: "#C79BFF", deep: "#5B2BA8", edge: "#381A6B", lip: "#381A6B" },
  dark: { face: "#3B5AA8", deep: "#12275C", edge: "#071233", lip: "#071233" },
};

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  sound?: boolean;
}

export function ChunkyButton({ tone = "cta", size = "md", sound = true, className = "", onClick, children, ...rest }: BtnProps) {
  const t = TONES[tone];
  const pad = size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-8 py-4 text-2xl" : "px-6 py-3 text-lg";
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (sound) play("click");
        onClick?.(e);
      }}
      style={
        {
          "--btn-face": t.face,
          "--btn-deep": t.deep,
          "--btn-edge": t.edge,
          "--btn-lip": t.lip,
        } as React.CSSProperties
      }
      className={`btn3d inline-flex items-center justify-center gap-2 font-display font-semibold text-white ${pad} ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Pelat berlekuk                                                      */
/* ------------------------------------------------------------------ */

export function Plate({
  children,
  className = "",
  glass = false,
}: {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return <div className={`${glass ? "plate-glass" : "plate"} rounded-[22px] ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Bintang                                                            */
/* ------------------------------------------------------------------ */

function StarPath({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 1.9c.5 0 .95.29 1.16.74l2.42 5.13 5.62.66c.5.06.9.4 1.06.88.16.48.02 1-.35 1.34l-4.16 3.77 1.11 5.53c.11.5-.11 1.01-.55 1.3-.44.29-1 .29-1.44.02L12 18.4l-4.87 2.87c-.44.27-.99.27-1.43-.02-.44-.29-.66-.8-.55-1.3l1.11-5.53-4.16-3.77a1.28 1.28 0 0 1-.35-1.34c.16-.48.56-.82 1.06-.88l5.62-.66 2.42-5.13c.21-.45.66-.74 1.16-.74Z"
        fill="currentColor"
        stroke="#8A5A00"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stars({ count, size = 34, dim = "#4B5C86" }: { count: number; size?: number; dim?: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.2, rotate: -35, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.12 * i, type: "spring", stiffness: 320, damping: 14 }}
          style={{ width: size, height: size, color: i < count ? "#FFD24A" : dim, filter: i < count ? "drop-shadow(0 3px 6px rgba(255,180,40,.55))" : "none" }}
        >
          <StarPath className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hati                                                               */
/* ------------------------------------------------------------------ */

export function Hearts({ n, max = 3, size = 26 }: { n: number; max?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 21s-7.7-4.6-9.5-9.3C1 7.9 3.4 4.6 6.9 4.6c2 0 3.6 1 5.1 2.8 1.5-1.8 3.1-2.8 5.1-2.8 3.5 0 5.9 3.3 4.4 7.1C19.7 16.4 12 21 12 21Z"
            fill={i < n ? "#FF4B6E" : "#33446E"}
            stroke={i < n ? "#8E1230" : "#22314F"}
            strokeWidth="1.4"
          />
          {i < n && <path d="M7.6 7.4c-1 0-1.8.8-1.8 1.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />}
        </svg>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Avatar robot / monster                                             */
/* ------------------------------------------------------------------ */

export function Avatar({
  img,
  ring = "#38E1FF",
  size = 96,
  hurt = false,
  attack = false,
  className = "",
  alt = "",
}: {
  img: string;
  ring?: string;
  size?: number;
  hurt?: boolean;
  attack?: boolean;
  className?: string;
  alt?: string;
}) {
  return (
    <div
      className={`relative shrink-0 rounded-[26px] p-[4px] ${hurt ? "anim-shake" : ""} ${className}`}
      style={{
        background: `linear-gradient(180deg, ${ring}, rgba(255,255,255,.15))`,
        boxShadow: attack
          ? `0 0 0 4px rgba(255,255,255,.85), 0 0 60px 12px ${ring}`
          : `0 12px 28px rgba(3,10,30,.55)`,
        width: size,
        height: size,
      }}
    >
      <div
        className="h-full w-full overflow-hidden rounded-[22px] bg-arena-900"
        style={{ boxShadow: "inset 0 0 0 2px rgba(8,18,46,.5)" }}
      >
        <img
          src={img}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ filter: hurt ? "saturate(.5) brightness(.8)" : "none" }}
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            (el.parentElement as HTMLElement).style.background = `radial-gradient(circle at 50% 35%, ${ring}, #0B1B3A 70%)`;
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bilah HP                                                           */
/* ------------------------------------------------------------------ */

export function HpBar({ value, color = "#4CE07A", label, right = false }: { value: number; color?: string; label: string; right?: boolean }) {
  return (
    <div className="w-full">
      <div className={`mb-1 flex items-center justify-between gap-2 ${right ? "flex-row-reverse" : ""}`}>
        <span className="label text-[10px] text-ice/80">{label}</span>
        <span className="tabnum font-display text-xs font-semibold text-white">{Math.max(0, Math.round(value))}</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full border-2 border-arena-950/70 bg-arena-950/80">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(180deg, ${color}, rgba(255,255,255,.25) 45%, ${color})`,
            boxShadow: `0 0 12px ${color}`,
          }}
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tombol ikon bulat (home / suara / setelan)                          */
/* ------------------------------------------------------------------ */

export function IconButton({
  onClick,
  children,
  label,
  active = true,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={() => {
        play("click");
        onClick();
      }}
      className="btn3d grid h-11 w-11 place-items-center rounded-full"
      style={
        {
          "--btn-face": "#6EC8FF",
          "--btn-deep": "#1667D6",
          "--btn-edge": "#0B3E8F",
          "--btn-lip": "#0B3E8F",
          opacity: active ? 1 : 0.55,
        } as React.CSSProperties
      }
    >
      {children}
    </button>
  );
}

export const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.2 12 4l9 7.2" />
    <path d="M5.5 10.5V20h13v-9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const SoundIcon = ({ on }: { on: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="#fff" />
    {on ? (
      <>
        <path d="M15.6 9a4 4 0 0 1 0 6" />
        <path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
      </>
    ) : (
      <>
        <path d="M16 9.5 21 15" />
        <path d="M21 9.5 16 15" />
      </>
    )}
  </svg>
);

export const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.6 7.6l2 1.2M17.4 15.2l2 1.2M4.6 16.4l2-1.2M17.4 8.8l2-1.2" />
  </svg>
);

export const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4.6 19.4 12 7 19.4z" fill="#fff" stroke="#B24A00" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Konfeti                                                            */
/* ------------------------------------------------------------------ */

export function Confetti({ count = 28 }: { count?: number }) {
  const colors = ["#FFD24A", "#38E1FF", "#FF6B6B", "#8CE86A", "#C79BFF", "#FF9A1F"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDuration: `${3 + (i % 5) * 0.7}s`,
            animationDelay: `${(i % 7) * 0.35}s`,
            transform: `rotate(${i * 24}deg)`,
          }}
        />
      ))}
    </div>
  );
}
