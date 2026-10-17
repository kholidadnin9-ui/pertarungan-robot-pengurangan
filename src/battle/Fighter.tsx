import { useId } from "react";
import type { CSSProperties } from "react";
import type { Fighter } from "../data";

export type FState =
  | "intro"
  | "idle"
  | "attack"
  | "hit"
  | "stun"
  | "charge"
  | "fire"
  | "destroyed"
  | "charred"
  | "gone"
  | "victory";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Tanduk Robot Monster (digambar di atas kepala sprite). */
function Horns({ head }: { head: { x: number; y: number } }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg className="horns" viewBox="0 0 100 60" style={{ left: `${head.x * 100}%`, top: `${head.y * 100}%` }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#17121d" />
          <stop offset="0.62" stopColor="#3d1529" />
          <stop offset="1" stopColor="#ff3d6e" />
        </linearGradient>
      </defs>
      <path d="M38 58 C30 44 22 30 6 3 C27 15 41 31 48 54 Z" fill={`url(#${gid})`} stroke="#0b0910" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M62 58 C70 44 78 30 94 3 C73 15 59 31 52 54 Z" fill={`url(#${gid})`} stroke="#0b0910" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 9 C22 18 30 28 36 40" stroke="#ff9db0" strokeOpacity=".55" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M88 9 C78 18 70 28 64 40" stroke="#ff9db0" strokeOpacity=".55" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Percikan listrik saat robot tersetrum (jawaban salah). */
function Zap() {
  return (
    <svg className="zap" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="28,18 38,30 31,35 44,50" />
      <polyline points="66,14 57,28 64,33 53,48" />
      <polyline points="40,58 50,64 44,71 56,82" />
    </svg>
  );
}

export function FighterSprite({ def, side, box, state, k }: { def: Fighter; side: 0 | 1; box: Box; state: FState; k: number }) {
  // sisi kiri menghadap kanan, sisi kanan menghadap kiri
  const mirrored = (side === 0) !== def.meta.facesRight;
  const dir = side === 0 ? 1 : -1;
  const charred = state === "charred" || state === "gone";
  const aura = state === "charge" || state === "fire";

  return (
    <div className="fighter" style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
      <div className="fighter-shadow" style={{ opacity: state === "gone" ? 0 : 1 }} />
      <div key={k} className={`fighter-anim fs-${state}`} style={{ "--dir": dir, "--aura": def.beamGlow } as CSSProperties}>
        <div className={`fighter-bobwrap ${state === "idle" ? "fighter-bob" : ""}`} style={{ animationDelay: side ? "-1.3s" : "0s" }}>
          {aura && <div className="aura" style={{ "--glow": def.beamGlow } as CSSProperties} />}
          <div className="fighter-flip" style={{ transform: mirrored ? "scaleX(-1)" : undefined }}>
            <img src={def.sprite} alt={def.nama} className="fighter-img" draggable={false} />
            {def.id === "monster" && <Horns head={def.meta.head} />}
            {charred && (
              <div
                className="embers"
                style={{ WebkitMaskImage: `url(${def.sprite})`, maskImage: `url(${def.sprite})` }}
              />
            )}
          </div>
          {state === "stun" && <Zap />}
        </div>
      </div>
    </div>
  );
}

/** Potret kepala robot untuk HUD dan kartu. */
export function HeadAvatar({ def, size, flip = false, zoom = 2.6 }: { def: Fighter; size: number; flip?: boolean; zoom?: number }) {
  const imgW = size * zoom;
  const imgH = imgW / def.meta.aspect;
  const bx = size / 2 - def.meta.head.x * imgW;
  const by = size * 0.56 - (def.meta.head.y + 0.035) * imgH;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border-2"
      style={{
        width: size,
        height: size,
        borderColor: def.face,
        background: `radial-gradient(circle at 50% 40%, ${def.deep}, #0b1b3a 78%)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${def.sprite})`,
          backgroundSize: `${imgW}px ${imgH}px`,
          backgroundPosition: `${bx}px ${by}px`,
          backgroundRepeat: "no-repeat",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      />
    </div>
  );
}
