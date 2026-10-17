import { useState } from "react";
import type { CSSProperties } from "react";
import type { Box } from "./Fighter";

export type Pt = { x: number; y: number };

const v = (o: Record<string, string | number | undefined>) => o as CSSProperties;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** nilai acak dibuat sekali saat efek muncul */
function useOnce<T>(make: () => T): T {
  const [val] = useState(make);
  return val;
}

/* ---------------- Laser biasa ---------------- */
export function Beam({ from, to, core, glow, thick }: { from: Pt; to: Pt; core: string; glow: string; thick: number }) {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  const ang = Math.atan2(to.y - from.y, to.x - from.x);
  return (
    <div className="beam" style={{ left: from.x, top: from.y - thick / 2, width: len, height: thick, transform: `rotate(${ang}rad)` }}>
      <div
        className="beam-body"
        style={v({
          "--core": core,
          "--glow": glow,
          boxShadow: `0 0 ${thick * 0.9}px ${thick * 0.25}px ${glow}, 0 0 ${thick * 2.4}px ${thick * 0.5}px ${glow}88`,
        })}
      >
        <div className="beam-tip" style={v({ "--s": `${thick * 2.6}px`, "--core": core, "--glow": glow })} />
      </div>
    </div>
  );
}

/* ---------------- Kilatan moncong meriam ---------------- */
export function MuzzleFlash({ at, size, core, glow }: { at: Pt; size: number; core: string; glow: string }) {
  const s = v({ "--s": `${size}px`, "--core": core, "--glow": glow });
  return (
    <div className="fx" style={{ left: at.x, top: at.y }}>
      <div className="muzzle" style={s} />
      <div className="ray" style={v({ "--s": `${size * 1.7}px`, "--core": core })} />
      <div className="rot90">
        <div className="ray" style={v({ "--s": `${size * 1.1}px`, "--core": core })} />
      </div>
    </div>
  );
}

/* ---------------- Tumbukan laser ---------------- */
export function Impact({ at, size, core, glow }: { at: Pt; size: number; core: string; glow: string }) {
  const sparks = useOnce(() =>
    Array.from({ length: 10 }, () => {
      const a = rand(0, Math.PI * 2);
      const r = size * rand(0.5, 1.05);
      return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, d: rand(0.3, 0.55) };
    })
  );
  return (
    <div className="fx" style={{ left: at.x, top: at.y }}>
      <div className="impact" style={v({ "--s": `${size}px`, "--core": core, "--glow": glow })} />
      <div className="rot45">
        <div className="ray" style={v({ "--s": `${size * 1.6}px`, "--core": core })} />
      </div>
      <div className="rot-45">
        <div className="ray" style={v({ "--s": `${size * 1.3}px`, "--core": core })} />
      </div>
      <div className="exp-ring" style={v({ "--s": `${size * 0.55}px` })} />
      {sparks.map((p, i) => (
        <div key={i} className="spark" style={v({ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDuration: `${p.d}s` })} />
      ))}
    </div>
  );
}

/* ---------------- Asap ---------------- */
export function Smoke({
  at,
  size,
  count = 6,
  spread,
  dir,
  dark = false,
  loop = false,
}: {
  at: Pt;
  size: number;
  count?: number;
  spread: number;
  dir: number;
  dark?: boolean;
  loop?: boolean;
}) {
  const puffs = useOnce(() =>
    Array.from({ length: count }, (_, i) => ({
      ox: rand(-spread, spread),
      oy: rand(-size * 0.35, size * 0.45),
      sx: dir * rand(10, 70) + rand(-24, 24),
      sy: rand(size * 0.9, size * 2),
      s: size * rand(0.7, 1.15),
      delay: i * (loop ? 0.26 : 0.09),
      d: rand(1.3, 1.95),
    }))
  );
  return (
    <div className="fx" style={{ left: at.x, top: at.y }}>
      {puffs.map((p, i) => (
        <div
          key={i}
          className={`puff ${dark ? "dark" : ""}`}
          style={v({
            left: p.ox,
            top: p.oy,
            "--s": `${p.s}px`,
            "--sx": `${p.sx}px`,
            "--sy": `${p.sy}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.d}s`,
            animationIterationCount: loop ? "infinite" : 1,
          })}
        />
      ))}
    </div>
  );
}

/* ---------------- Ledakan ---------------- */
export function Explosion({ at, size, huge = false }: { at: Pt; size: number; huge?: boolean }) {
  const parts = useOnce(() => {
    const n = huge ? 18 : 11;
    return {
      fires: Array.from({ length: huge ? 6 : 3 }, (_, i) => ({
        ox: rand(-0.2, 0.2) * size,
        oy: rand(-0.2, 0.12) * size,
        s: size * rand(0.55, 0.95),
        delay: i * 0.07,
        d: rand(0.75, 1.05),
      })),
      debris: Array.from({ length: n }, () => {
        const a = rand(0, Math.PI * 2);
        const r = size * rand(0.6, 1.5);
        return { dx: Math.cos(a) * r, dy: Math.sin(a) * r - size * 0.25, rot: rand(-560, 560), w: rand(5, 12), h: rand(8, 18), d: rand(0.7, 1.15) };
      }),
      sparks: Array.from({ length: n }, () => {
        const a = rand(0, Math.PI * 2);
        const r = size * rand(0.5, 1.15);
        return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, d: rand(0.35, 0.65) };
      }),
      smoke: Array.from({ length: huge ? 8 : 4 }, (_, i) => ({
        ox: rand(-0.3, 0.3) * size,
        oy: rand(-0.1, 0.15) * size,
        s: size * rand(0.5, 0.85),
        sx: rand(-50, 50),
        sy: size * rand(0.5, 1),
        delay: 0.15 + i * 0.08,
        d: rand(1.2, 1.8),
      })),
    };
  });
  return (
    <div className="fx" style={{ left: at.x, top: at.y }}>
      {parts.smoke.map((p, i) => (
        <div
          key={`s${i}`}
          className="puff dark"
          style={v({ left: p.ox, top: p.oy, "--s": `${p.s}px`, "--sx": `${p.sx}px`, "--sy": `${p.sy}px`, "--grow": 1.9, animationDelay: `${p.delay}s`, animationDuration: `${p.d}s` })}
        />
      ))}
      <div className="exp-flash" style={v({ "--s": `${size * 1.25}px` })} />
      {parts.fires.map((p, i) => (
        <div key={`f${i}`} className="exp-fire" style={v({ left: p.ox, top: p.oy, "--s": `${p.s}px`, animationDelay: `${p.delay}s`, animationDuration: `${p.d}s` })} />
      ))}
      <div className="exp-ring" style={v({ "--s": `${size * 0.7}px` })} />
      {parts.debris.map((p, i) => (
        <div
          key={`d${i}`}
          className="debris"
          style={v({ "--w": `${p.w}px`, "--h": `${p.h}px`, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, animationDuration: `${p.d}s` })}
        />
      ))}
      {parts.sparks.map((p, i) => (
        <div key={`k${i}`} className="spark" style={v({ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDuration: `${p.d}s` })} />
      ))}
    </div>
  );
}

/* ---------------- Angka kerusakan ---------------- */
export function DamagePop({ at, text, big = false }: { at: Pt; text: string; big?: boolean }) {
  return (
    <div className="fx" style={{ left: at.x, top: at.y }}>
      <div className={`dmg ${big ? "dmg-big" : ""}`}>{text}</div>
    </div>
  );
}

/* ---------------- Bola energi (pengisian serangan pamungkas) ---------------- */
export function ChargeOrb({ at, size, core, glow }: { at: Pt; size: number; core: string; glow: string }) {
  const parts = useOnce(() =>
    Array.from({ length: 16 }, (_, i) => {
      const a = rand(0, Math.PI * 2);
      const r = size * rand(0.9, 1.7);
      return { px: Math.cos(a) * r, py: Math.sin(a) * r, delay: (i % 8) * 0.09 };
    })
  );
  return (
    <div className="fx" style={{ left: at.x, top: at.y }}>
      <div className="orb" style={v({ "--s": `${size}px`, "--core": core, "--glow": glow, boxShadow: `0 0 ${size * 0.5}px ${size * 0.15}px ${glow}` })} />
      {[0, 0.32, 0.64].map((d) => (
        <div key={d} className="orb-ring" style={v({ "--s": `${size * 1.5}px`, "--core": core, "--glow": glow, animationDelay: `${d}s` })} />
      ))}
      {parts.map((p, i) => (
        <div key={i} className="orb-particle" style={v({ "--px": `${p.px}px`, "--py": `${p.py}px`, "--glow": glow, animationDelay: `${p.delay}s` })} />
      ))}
    </div>
  );
}

/* ---------------- Laser raksasa ---------------- */
export function MegaBeam({ from, to, core, glow, thick, extra }: { from: Pt; to: Pt; core: string; glow: string; thick: number; extra: number }) {
  const len = Math.hypot(to.x - from.x, to.y - from.y) + extra;
  const ang = Math.atan2(to.y - from.y, to.x - from.x);
  return (
    <div className="mega" style={{ left: from.x, top: from.y - thick / 2, width: len, height: thick, transform: `rotate(${ang}rad)` }}>
      <div
        className="mega-body"
        style={v({
          "--core": core,
          "--glow": glow,
          boxShadow: `0 0 ${thick * 0.6}px ${thick * 0.2}px ${glow}, 0 0 ${thick * 1.6}px ${thick * 0.45}px ${glow}99`,
        })}
      >
        <div className="mega-flow" />
        <div className="mega-core" />
      </div>
      <div className="mega-muzzle" style={v({ "--s": `${thick * 1.9}px`, "--core": core, "--glow": glow })} />
    </div>
  );
}

/* ---------------- Api pada robot hangus ---------------- */
export function Flames({ points, size }: { points: Pt[]; size: number }) {
  return (
    <>
      {points.map((p, i) => (
        <div key={i} className="fx" style={{ left: p.x, top: p.y }}>
          <div className="flame" style={v({ "--s": `${size * (i === 0 ? 1.15 : 0.85)}px`, animationDelay: `${i * 0.05}s, ${1.35 + i * 0.08}s` })} />
        </div>
      ))}
    </>
  );
}

/* ---------------- Abu: robot hancur lalu menghilang ---------------- */
export function Ash({ box, dir }: { box: Box; dir: number }) {
  const ps = useOnce(() =>
    Array.from({ length: 46 }, () => {
      const fy = rand(0.04, 0.92);
      const r = Math.random();
      return {
        x: box.x + box.w * rand(0.16, 0.84),
        y: box.y + box.h * fy,
        dx: dir * rand(30, 180) + rand(-28, 28),
        dy: -rand(50, 240),
        rot: rand(-360, 360),
        s: rand(3, 9),
        c: r < 0.28 ? "#ff8a2a" : r < 0.6 ? "#3a3640" : "#1d1b22",
        // larut dari atas ke bawah mengikuti topeng sprite
        delay: fy * 0.95 + rand(0, 0.15),
        d: rand(1.1, 1.8),
      };
    })
  );
  return (
    <>
      {ps.map((p, i) => (
        <div
          key={i}
          className="ash"
          style={v({
            left: p.x,
            top: p.y,
            "--s": `${p.s}px`,
            "--c": p.c,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            "--rot": `${p.rot}deg`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.d}s`,
          })}
        />
      ))}
    </>
  );
}
