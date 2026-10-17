import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FighterSprite, HeadAvatar, type Box, type FState } from "../battle/Fighter";
import { Ash, Beam, ChargeOrb, DamagePop, Explosion, Flames, Impact, MegaBeam, MuzzleFlash, Smoke, type Pt } from "../battle/fx";
import {
  ARENA_IMG,
  TOTAL_QUESTIONS,
  makeQuestion,
  rankFor,
  roundStarFor,
  starsFor,
  type Fighter,
  type LevelDef,
  type Question,
} from "../data";
import { play } from "../sound";
import { ChunkyButton, Confetti, IconButton, SoundIcon, Stars } from "../ui";

type Side = 0 | 1;
type Phase = "intro" | "countdown" | "ask" | "busy" | "finale" | "result";
type FxKind = "muzzle" | "beam" | "impact" | "smoke" | "explosion" | "damage" | "charge" | "mega" | "flames" | "ash";

interface FxItem {
  id: number;
  kind: FxKind;
  side: Side;
  big?: boolean;
  huge?: boolean;
  dark?: boolean;
  loop?: boolean;
  charred?: boolean;
  dx?: number;
  dy?: number;
  amount?: number;
}
interface Stat {
  hits: number;
  wrong: number;
  times: number[];
}
interface PopupMsg {
  title: string;
  sub?: string;
  tone: "good" | "bad" | "warn" | "info";
  key: number;
}
interface BannerMsg {
  text: string;
  sub?: string;
  kind: "count" | "banner" | "final" | "ko";
  key: number;
  glow?: string;
}
interface ResultInfo {
  winner: Side;
  stars: number;
  stats: [Stat, Stat];
}

interface Props {
  mode: 1 | 2;
  level: LevelDef;
  fighters: [Fighter, Fighter];
  soundOn: boolean;
  hasNextLevel: boolean;
  onToggleSound: () => void;
  onExit: () => void;
  onHome: () => void;
  onRetry: () => void;
  onNextLevel: () => void;
  onComplete: (stars: number, rounds: number[]) => void;
}

const DMG = 10;
const other = (s: Side): Side => (s === 0 ? 1 : 0);

const OPTION_STYLE = [
  { "--btn-face": "#FF7B7B", "--btn-deep": "#C41E1E", "--btn-edge": "#7E1010", "--btn-lip": "#7E1010" },
  { "--btn-face": "#6EC8FF", "--btn-deep": "#1667D6", "--btn-edge": "#0B3E8F", "--btn-lip": "#0B3E8F" },
  { "--btn-face": "#8CE86A", "--btn-deep": "#2E9E22", "--btn-edge": "#1A6B12", "--btn-lip": "#1A6B12" },
] as unknown as CSSProperties[];

const KEYS: [string[], string[]] = [
  ["1", "2", "3"],
  ["8", "9", "0"],
];

const TONE_BG: Record<PopupMsg["tone"], string> = {
  good: "linear-gradient(180deg,#3FBF34,#15780F)",
  bad: "linear-gradient(180deg,#E23B3B,#8E1010)",
  warn: "linear-gradient(180deg,#FFB23F,#C25400)",
  info: "linear-gradient(180deg,#4A6CC8,#1B2F6E)",
};

/* ------------------------------------------------------------------ */
/*  Geometri panggung                                                  */
/* ------------------------------------------------------------------ */

function boxFor(side: Side, def: Fighter, W: number, H: number): Box {
  const s = def.meta.scale;
  const wf = W < 600 ? 0.42 : 0.38;
  const h = Math.min(H * 0.8 * s, (W * wf * s) / def.meta.aspect, H * 0.96);
  const w = h * def.meta.aspect;
  const margin = Math.max(6, W * 0.025);
  const floor = H * 0.975;
  return { x: side === 0 ? margin : W - margin - w, y: floor - h, w, h };
}

function anchor(side: Side, def: Fighter, box: Box, which: "muzzle" | "core" | "head"): Pt {
  const p = def.meta[which];
  const mirrored = (side === 0) !== def.meta.facesRight;
  return { x: box.x + (mirrored ? 1 - p.x : p.x) * box.w, y: box.y + p.y * box.h };
}

/* ------------------------------------------------------------------ */
/*  Komponen kecil HUD                                                 */
/* ------------------------------------------------------------------ */

function TimerRing({ value, max, label }: { value: number; max: number; label: string }) {
  const R = 23;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, value / Math.max(0.001, max)));
  const color = pct > 0.5 ? "#4CE07A" : pct > 0.25 ? "#FFD24A" : "#FF5B5B";
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative h-[54px] w-[54px] sm:h-[60px] sm:w-[60px]">
        <svg viewBox="0 0 58 58" className="h-full w-full -rotate-90">
          <circle cx="29" cy="29" r={R} fill="rgba(8,18,46,.85)" stroke="rgba(127,216,255,.25)" strokeWidth="6" />
          <circle
            cx="29"
            cy="29"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            style={{ transition: "stroke-dashoffset .12s linear" }}
          />
        </svg>
        <span className="tabnum absolute inset-0 grid place-items-center font-game text-base text-white">{Math.ceil(value)}</span>
      </div>
      <span className="label mt-0.5 hidden whitespace-nowrap text-[8px] text-ice/80 sm:block">{label}</span>
    </div>
  );
}

function HudCard({ def, hp, tag, right = false }: { def: Fighter; hp: number; tag: string; right?: boolean }) {
  const low = hp <= 30;
  const fill =
    hp > 50
      ? "linear-gradient(180deg,#A6FFBE,#22C55E 60%,#15803D)"
      : hp > 30
        ? "linear-gradient(180deg,#FFF0A0,#F59E0B 60%,#B45309)"
        : "linear-gradient(180deg,#FFB3C0,#E11D48 60%,#9F1239)";
  return (
    <div className={`plate flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-2 py-1.5 sm:gap-3 sm:px-3 ${right ? "flex-row-reverse" : ""}`}>
      <HeadAvatar def={def} size={44} flip={right} />
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-2 ${right ? "flex-row-reverse" : ""}`}>
          <span className="truncate font-game text-[11px] text-white sm:text-sm">{def.nama}</span>
          <span className="label hidden shrink-0 rounded-full px-2 py-0.5 text-[9px] text-white md:inline" style={{ background: def.deep }}>
            {tag}
          </span>
        </div>
        <div className="mt-1 h-3.5 w-full overflow-hidden rounded-full border-2 border-arena-950/80 bg-arena-950/80 sm:h-4">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${low ? "hp-low" : ""} ${right ? "ml-auto" : ""}`}
            style={{ width: `${hp}%`, background: fill }}
          />
        </div>
        <div className={`mt-0.5 flex text-[10px] font-extrabold text-ice/75 [@media(max-height:520px)]:hidden ${right ? "justify-start" : "justify-end"}`}>
          <span className="tabnum">{hp} HP</span>
        </div>
      </div>
    </div>
  );
}

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6" y="5" width="4.2" height="14" rx="1.3" fill="#fff" />
    <rect x="13.8" y="5" width="4.2" height="14" rx="1.3" fill="#fff" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Pertarungan                                                        */
/* ------------------------------------------------------------------ */

export default function Battle({
  mode,
  level,
  fighters,
  soundOn,
  hasNextLevel,
  onToggleSound,
  onExit,
  onHome,
  onRetry,
  onNextLevel,
  onComplete,
}: Props) {
  const LIMIT = mode === 1 ? 30 : 20;

  /* ---------- state + ref (ref dipakai oleh timer agar tidak basi) ---------- */
  const [phase, setPhaseState] = useState<Phase>("intro");
  const phaseRef = useRef<Phase>("intro");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const [q, setQ] = useState<Question>(() => makeQuestion(level));
  const qRef = useRef<Question>(q);
  const [qIndex, setQIndex] = useState(0);
  const qIndexRef = useRef(0);
  const [sudden, setSudden] = useState(false);
  const suddenRef = useRef(false);

  const [hp, setHpState] = useState<[number, number]>([100, 100]);
  const hpRef = useRef<[number, number]>([100, 100]);
  const setHp = (h: [number, number]) => {
    hpRef.current = h;
    setHpState(h);
  };

  const [fst, setFst] = useState<[FState, FState]>(["intro", "intro"]);
  const fstRef = useRef<[FState, FState]>(["intro", "intro"]);
  const [fkey, setFkey] = useState<[number, number]>([0, 0]);
  const setF = (side: Side, s: FState) => {
    const n: [FState, FState] = [fstRef.current[0], fstRef.current[1]];
    n[side] = s;
    fstRef.current = n;
    setFst(n);
    setFkey((p) => {
      const k: [number, number] = [p[0], p[1]];
      k[side] += 1;
      return k;
    });
  };

  const [fx, setFx] = useState<FxItem[]>([]);
  const fxId = useRef(0);
  const [banner, setBanner] = useState<BannerMsg | null>(null);
  const [popup, setPopup] = useState<PopupMsg | null>(null);

  const [locked, setLockedState] = useState<[boolean, boolean]>([false, false]);
  const lockedRef = useRef<[boolean, boolean]>([false, false]);
  const [stunned, setStunnedState] = useState<[boolean, boolean]>([false, false]);
  const stunRef = useRef<[boolean, boolean]>([false, false]);

  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const [monsterAt, setMonsterAt] = useState(Infinity);
  const monsterAtRef = useRef(Infinity);
  const monsterMissRef = useRef(false);

  const [shake, setShake] = useState<{ kind: "shake" | "quake"; n: number } | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [glow, setGlow] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [wrongBtn, setWrongBtn] = useState<{ side: Side; idx: number; n: number } | null>(null);
  const [paused, setPausedState] = useState(false);
  const pausedRef = useRef(false);
  const [result, setResult] = useState<ResultInfo | null>(null);

  const statsRef = useRef<[Stat, Stat]>([
    { hits: 0, wrong: 0, times: [] },
    { hits: 0, wrong: 0, times: [] },
  ]);
  const roundStarsRef = useRef<number[]>(Array(TOTAL_QUESTIONS).fill(0));
  const usedRef = useRef<Set<string>>(new Set());
  const counter = useRef(0);
  const nextKey = () => ++counter.current;

  /* ---------- penjadwal ---------- */
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    },
    []
  );

  const setLock = (side: Side, val: boolean) => {
    const n: [boolean, boolean] = [lockedRef.current[0], lockedRef.current[1]];
    n[side] = val;
    lockedRef.current = n;
    setLockedState(n);
  };
  const setStun = (side: Side, val: boolean) => {
    const n: [boolean, boolean] = [stunRef.current[0], stunRef.current[1]];
    n[side] = val;
    stunRef.current = n;
    setStunnedState(n);
  };
  const setPaused = (val: boolean) => {
    pausedRef.current = val;
    setPausedState(val);
  };

  const addFx = (item: Omit<FxItem, "id">, ms: number) => {
    const id = ++fxId.current;
    setFx((l) => [...l, { ...item, id }]);
    later(() => setFx((l) => l.filter((f) => f.id !== id)), ms);
  };
  const doShake = (kind: "shake" | "quake") => setShake((s) => ({ kind, n: (s?.n ?? 0) + 1 }));
  const say = (title: string, sub: string | undefined, tone: PopupMsg["tone"]) => setPopup({ title, sub, tone, key: nextKey() });

  /* ---------- ukuran panggung ---------- */
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const boxes = useMemo<[Box, Box]>(
    () => [boxFor(0, fighters[0], size.w, size.h), boxFor(1, fighters[1], size.w, size.h)],
    [size, fighters]
  );
  const at = (side: Side, which: "muzzle" | "core" | "head") => anchor(side, fighters[side], boxes[side], which);

  /* ================================================================ */
  /*  ALUR PERTARUNGAN                                                 */
  /* ================================================================ */

  function runCountdown() {
    setPhase("countdown");
    ["3", "2", "1", "MULAI!"].forEach((t, i) =>
      later(() => {
        setBanner({ text: t, kind: "count", key: nextKey() });
        play(i < 3 ? "beep" : "go");
      }, i * 640)
    );
    later(() => {
      setBanner(null);
      newRound(0, false);
    }, 4 * 640);
  }

  function newRound(index: number, isSudden: boolean) {
    let nq = makeQuestion(level);
    let guard = 0;
    while (usedRef.current.has(`${nq.a}-${nq.b}`) && guard++ < 30) nq = makeQuestion(level);
    usedRef.current.add(`${nq.a}-${nq.b}`);
    qRef.current = nq;
    setQ(nq);
    qIndexRef.current = index;
    setQIndex(index);
    suddenRef.current = isSudden;
    setSudden(isSudden);

    lockedRef.current = [false, false];
    setLockedState([false, false]);
    stunRef.current = [false, false];
    setStunnedState([false, false]);
    setReveal(false);
    setWrongBtn(null);

    elapsedRef.current = 0;
    setElapsed(0);
    if (mode === 1) {
      const [a, b] = level.monsterTime;
      const t = a + Math.random() * (b - a);
      monsterAtRef.current = t;
      setMonsterAt(t);
      monsterMissRef.current = Math.random() < level.monsterMiss;
    } else {
      monsterAtRef.current = Infinity;
      setMonsterAt(Infinity);
    }
    setPhase("ask");
  }

  /* ---------- jawaban pemain ---------- */
  function answer(side: Side, idx: number) {
    if (phaseRef.current !== "ask" || pausedRef.current) return;
    if (mode === 1 && side === 1) return;
    if (lockedRef.current[side] || stunRef.current[side]) return;

    const cq = qRef.current;
    const st = statsRef.current[side];
    if (cq.options[idx] === cq.answer) {
      st.hits += 1;
      st.times.push(elapsedRef.current);
      if (mode === 1 && qIndexRef.current < TOTAL_QUESTIONS) {
        const r = roundStarFor(elapsedRef.current);
        roundStarsRef.current[qIndexRef.current] = Math.max(roundStarsRef.current[qIndexRef.current], r);
      }
      play("correct");
      if (mode === 1) say("Jawaban Benar!", "Hebat! Kamu sudah menjawab dengan tepat!", "good");
      else say(`PEMAIN ${side + 1} BENAR!`, `Serangan ${fighters[side].jurus}!`, "good");
      strike(side);
      return;
    }

    // jawaban salah
    st.wrong += 1;
    setWrongBtn({ side, idx, n: nextKey() });
    play("wrong");
    later(() => play("zap"), 80);
    setF(side, "stun");
    if (mode === 1) {
      setStun(0, true);
      say("Jawaban Salah", "Ayo coba lagi! Jangan menyerah ya!", "bad");
      later(() => {
        setStun(0, false);
        if (fstRef.current[0] === "stun") setF(0, "idle");
      }, 1400);
      return;
    }
    setLock(side, true);
    later(() => {
      if (fstRef.current[side] === "stun") setF(side, "idle");
    }, 900);
    const o = other(side);
    if (lockedRef.current[o]) allWrong();
    else say(`Pemain ${side + 1} salah!`, `Pemain ${o + 1}, ayo jawab!`, "bad");
  }

  /* ---------- Robot Monster menjawab (mode 1 pemain) ---------- */
  function monsterAnswer() {
    if (monsterMissRef.current) {
      monsterMissRef.current = false;
      setLock(1, true);
      setF(1, "stun");
      play("zap");
      say("Monster salah!", "Ayo jawab sekarang!", "warn");
      later(() => {
        if (fstRef.current[1] === "stun") setF(1, "idle");
      }, 1000);
      return;
    }
    statsRef.current[1].hits += 1;
    statsRef.current[1].times.push(elapsedRef.current);
    say("Monster lebih cepat!", `Jawabannya ${qRef.current.answer}`, "bad");
    strike(1);
  }

  function timeUp() {
    setPhase("busy");
    setReveal(true);
    play("wrong");
    say("WAKTU HABIS!", `Jawaban yang benar: ${qRef.current.answer}`, "info");
    later(afterRound, 1900);
  }

  function allWrong() {
    setPhase("busy");
    setReveal(true);
    say("SEMUA SALAH!", `Jawaban yang benar: ${qRef.current.answer}`, "info");
    later(afterRound, 1900);
  }

  /* ---------- menyerang ---------- */
  function strike(a: Side) {
    setPhase("busy");
    setReveal(true);
    const t = other(a);
    const h = hpRef.current;
    const next: [number, number] = [h[0], h[1]];
    next[t] = Math.max(0, next[t] - DMG);
    const last = qIndexRef.current >= TOTAL_QUESTIONS - 1 || suddenRef.current;
    const decided = next[t] <= 0 || (last && next[0] !== next[1]);
    const winner: Side = next[0] > next[1] ? 0 : 1;
    if (decided && winner === a) {
      // pukulan penentu langsung menjadi serangan pamungkas
      later(() => finale(a), 700);
      return;
    }
    normalAttack(a, next);
    later(afterRound, 2250);
  }

  /** laser → lawan terkena → keluar asap → ledakan */
  function normalAttack(a: Side, next: [number, number]) {
    const t = other(a);
    setF(a, "attack");
    play("laser");
    addFx({ kind: "muzzle", side: a }, 450);
    later(() => addFx({ kind: "beam", side: a }, 600), 70);
    later(() => {
      setF(t, "hit");
      play("hit");
      addFx({ kind: "impact", side: t }, 560);
      addFx({ kind: "damage", side: t, amount: DMG }, 1200);
      setHp(next);
      doShake("shake");
    }, 320);
    later(() => {
      addFx({ kind: "smoke", side: t }, 2200);
      play("smoke");
    }, 400);
    later(() => {
      addFx({ kind: "explosion", side: t }, 1500);
      play("explosion");
      doShake("shake");
    }, 900);
    later(() => {
      setF(a, "idle");
      setF(t, "idle");
    }, 1300);
  }

  function afterRound() {
    if (phaseRef.current === "finale" || phaseRef.current === "result") return;
    const last = qIndexRef.current >= TOTAL_QUESTIONS - 1 || suddenRef.current;
    if (!last) {
      newRound(qIndexRef.current + 1, false);
      return;
    }
    const h = hpRef.current;
    if (h[0] !== h[1]) {
      finale(h[0] > h[1] ? 0 : 1);
      return;
    }
    // nilai sama → soal penentuan
    setPhase("busy");
    setBanner({ text: "SOAL PENENTUAN!", sub: "Siapa yang paling cepat?", kind: "banner", key: nextKey() });
    play("start");
    later(() => {
      setBanner(null);
      newRound(qIndexRef.current + 1, true);
    }, 1850);
  }

  /** Serangan pamungkas: isi energi → laser raksasa → ledakan → asap → hangus → hilang → K.O. */
  function finale(w: Side) {
    setPhase("finale");
    setReveal(false);
    const l = other(w);
    const def = fighters[w];

    setGlow(def.beamGlow);
    setBanner({ text: "SERANGAN PAMUNGKAS!", sub: `${def.jurus}!`, kind: "final", key: nextKey(), glow: def.beamGlow });
    play("powerup");
    setF(w, "charge");
    setF(l, "idle");
    addFx({ kind: "charge", side: w }, 1850);

    later(() => {
      setBanner(null);
      setF(w, "fire");
      play("megalaser");
      addFx({ kind: "mega", side: w }, 1550);
      setFlashKey((k) => k + 1);
      doShake("quake");
    }, 1750);

    later(() => {
      setF(l, "destroyed");
      play("hit");
      addFx({ kind: "impact", side: l, big: true }, 640);
      addFx({ kind: "damage", side: l, big: true, amount: hpRef.current[l] }, 1300);
      const n: [number, number] = [hpRef.current[0], hpRef.current[1]];
      n[l] = 0;
      setHp(n);
    }, 1850);

    later(() => {
      addFx({ kind: "explosion", side: l, big: true, dx: -0.14, dy: -0.12 }, 1600);
      play("explosion");
    }, 2150);
    later(() => {
      addFx({ kind: "explosion", side: l, big: true, dx: 0.12, dy: 0.1 }, 1600);
      play("explosion");
    }, 2500);
    later(() => addFx({ kind: "explosion", side: l, big: true, dx: -0.02, dy: -0.3 }, 1600), 2800);

    // ledakan terbesar saat laser berakhir
    later(() => {
      addFx({ kind: "explosion", side: l, huge: true }, 1900);
      play("bigboom");
      setFlashKey((k) => k + 1);
      doShake("quake");
      setF(w, "idle");
    }, 3300);

    // hangus + asap tebal + api
    later(() => {
      setF(l, "charred");
      addFx({ kind: "smoke", side: l, dark: true, big: true, loop: true, charred: true }, 4300);
      addFx({ kind: "flames", side: l, charred: true }, 1950);
      play("smoke");
    }, 3500);

    // larut menjadi abu lalu hilang
    later(() => {
      setF(l, "gone");
      addFx({ kind: "ash", side: l, charred: true }, 2600);
      play("vanish");
    }, 5200);

    later(() => {
      setGlow(null);
      setBanner({ text: "K.O.!", kind: "ko", key: nextKey() });
      play("ko");
      setF(w, "victory");
    }, 6300);

    later(() => {
      setBanner(null);
      showResult(w);
    }, 7900);
  }

  function showResult(w: Side) {
    setPhase("result");
    const s0 = statsRef.current[0];
    const stars = mode === 1 && w === 0 ? starsFor(s0.hits) : mode === 2 ? starsFor(statsRef.current[w].hits) : 0;
    if (mode === 1) onComplete(stars, roundStarsRef.current);
    play(mode === 1 && w === 1 ? "lose" : "win");
    setResult({ winner: w, stars, stats: [statsRef.current[0], statsRef.current[1]] });
  }

  /* ---------- mulai: robot masuk arena lalu hitung mundur ---------- */
  useEffect(() => {
    setBanner({ text: "BERSIAP!", sub: "Robot memasuki arena...", kind: "banner", key: nextKey() });
    play("whoosh");
    later(() => play("land"), 650);
    later(() => {
      setF(0, "idle");
      setF(1, "idle");
      runCountdown();
    }, 1350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- detak waktu ---------- */
  useEffect(() => {
    if (phase !== "ask") return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      if (pausedRef.current || phaseRef.current !== "ask") return;
      elapsedRef.current += dt;
      const e = elapsedRef.current;
      setElapsed(e);
      if (mode === 1 && !lockedRef.current[1] && e >= monsterAtRef.current) {
        monsterAnswer();
        return;
      }
      if (e >= LIMIT) timeUp();
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "escape" || k === "p") {
        if (phaseRef.current === "ask") setPaused(!pausedRef.current);
        return;
      }
      const p1: Record<string, number> = { "1": 0, "2": 1, "3": 2, a: 0, s: 1, d: 2 };
      const p2: Record<string, number> = { "8": 0, "9": 1, "0": 2, j: 0, k: 1, l: 2 };
      if (k in p1) {
        e.preventDefault();
        answer(0, p1[k]);
      } else if (mode === 2 && k in p2) {
        e.preventDefault();
        answer(1, p2[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  const renderFx = (f: FxItem) => {
    const def = fighters[f.side];
    const box = boxes[f.side];
    const H = box.h;
    const away = f.side === 0 ? -1 : 1;
    // robot yang hangus bergeser mengikuti pose terpental
    const off: Pt = f.charred ? { x: away * 34, y: 16 } : { x: 0, y: 0 };
    const sh = (p: Pt): Pt => ({ x: p.x + off.x, y: p.y + off.y });
    switch (f.kind) {
      case "muzzle":
        return <MuzzleFlash key={f.id} at={at(f.side, "muzzle")} size={H * 0.32} core={def.beam} glow={def.beamGlow} />;
      case "beam":
        return (
          <Beam
            key={f.id}
            from={at(f.side, "muzzle")}
            to={at(other(f.side), "core")}
            core={def.beam}
            glow={def.beamGlow}
            thick={Math.max(9, H * 0.065)}
          />
        );
      case "impact": {
        const atk = fighters[other(f.side)];
        return <Impact key={f.id} at={at(f.side, "core")} size={H * (f.big ? 0.95 : 0.55)} core={atk.beam} glow={atk.beamGlow} />;
      }
      case "smoke":
        return (
          <Smoke
            key={f.id}
            at={sh(at(f.side, "core"))}
            size={H * (f.big ? 0.36 : 0.26)}
            count={f.big ? 11 : 7}
            spread={box.w * (f.big ? 0.26 : 0.16)}
            dir={away}
            dark={f.dark}
            loop={f.loop}
          />
        );
      case "explosion": {
        const c = at(f.side, "core");
        return (
          <Explosion
            key={f.id}
            at={{ x: c.x + (f.dx ?? 0) * box.w, y: c.y + (f.dy ?? 0) * box.h }}
            size={H * (f.huge ? 1.2 : f.big ? 0.7 : 0.5)}
            huge={f.huge}
          />
        );
      }
      case "damage": {
        const hd = at(f.side, "head");
        return <DamagePop key={f.id} at={{ x: hd.x, y: hd.y - H * 0.05 }} text={`-${f.amount ?? DMG}`} big={f.big} />;
      }
      case "charge":
        return <ChargeOrb key={f.id} at={at(f.side, "muzzle")} size={H * 0.4} core={def.beam} glow={def.beamGlow} />;
      case "mega":
        return (
          <MegaBeam
            key={f.id}
            from={at(f.side, "muzzle")}
            to={at(other(f.side), "core")}
            core={def.beam}
            glow={def.beamGlow}
            thick={Math.max(36, H * 0.3)}
            extra={size.w}
          />
        );
      case "flames": {
        const c = at(f.side, "core");
        const hd = at(f.side, "head");
        const m = at(f.side, "muzzle");
        return (
          <Flames
            key={f.id}
            size={H * 0.16}
            points={[
              sh({ x: hd.x, y: hd.y + H * 0.05 }),
              sh({ x: c.x - away * box.w * 0.06, y: c.y + H * 0.02 }),
              sh({ x: (c.x + m.x) / 2, y: m.y + H * 0.06 }),
              sh({ x: c.x + away * box.w * 0.05, y: c.y + H * 0.24 }),
            ]}
          />
        );
      }
      case "ash":
        return <Ash key={f.id} box={{ ...box, x: box.x + off.x, y: box.y + off.y }} dir={away} />;
    }
  };

  const monsterRace = mode === 1 && !locked[1] && Number.isFinite(monsterAt);
  const ringMax = monsterRace ? monsterAt : LIMIT;
  const ringVal = Math.max(0, ringMax - elapsed);
  const showQ = phase === "ask" || phase === "busy" || phase === "finale";
  const stageAnim = shake ? `stage-${shake.kind}-${shake.n % 2 ? "a" : "b"}` : "";
  const fastest = (s: Stat) => (s.times.length ? `${Math.min(...s.times).toFixed(1)} dtk` : "-");

  const pad = (side: Side) => {
    const def = fighters[side];
    const isLocked = locked[side];
    const isStunned = stunned[side];
    const disabled = phase !== "ask" || paused || isLocked || isStunned;
    const hidden = phase === "intro" || phase === "countdown";
    return (
      <div
        key={side}
        className={`relative rounded-[22px] ${mode === 2 ? "border-2 bg-arena-950/60 p-2 sm:p-3" : "mx-auto w-full max-w-3xl"}`}
        style={mode === 2 ? { borderColor: `${def.face}88` } : undefined}
      >
        {mode === 2 ? (
          <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
            <span className="truncate font-game text-[11px] sm:text-xs" style={{ color: def.face }}>
              PEMAIN {side + 1} · {def.label}
            </span>
            <span className="hidden shrink-0 rounded-full bg-arena-950/80 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-ice/75 sm:inline">
              TEKAN {KEYS[side].join(" ")}
            </span>
          </div>
        ) : (
          <p className="mb-1.5 text-center text-[11px] font-extrabold tracking-wide text-ice/80 sm:text-xs [@media(max-height:520px)]:hidden">
            Pilih 1 dari 3 jawaban secepat mungkin! (atau tekan 1 · 2 · 3)
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {q.options.map((opt, i) => {
            const isAns = opt === q.answer;
            const shakeCls = wrongBtn && wrongBtn.side === side && wrongBtn.idx === i ? (wrongBtn.n % 2 ? "btn-shake-a" : "btn-shake-b") : "";
            return (
              <button
                key={`${qIndex}-${i}`}
                disabled={disabled}
                onClick={() => answer(side, i)}
                aria-label={`Jawaban ${hidden ? "" : opt}`}
                className={`btn3d min-h-[48px] text-white ${mode === 2 ? "py-2 sm:py-3" : "py-2.5 sm:py-3.5"} ${reveal && isAns ? "reveal-ok" : ""} ${
                  reveal && !isAns ? "opacity-40" : ""
                } ${shakeCls}`}
                style={OPTION_STYLE[i]}
              >
                <span
                  className="tabnum font-game leading-none"
                  style={{
                    fontSize: mode === 2 ? "clamp(1.2rem,min(3.6vw,5.5vh),2.1rem)" : "clamp(1.4rem,min(5vw,6.5vh),2.7rem)",
                    textShadow: "0 3px 0 rgba(0,0,0,.28)",
                  }}
                >
                  {hidden ? "?" : opt}
                </span>
                <span className="keycap">{KEYS[side][i]}</span>
              </button>
            );
          })}
        </div>
        {(isLocked || isStunned) && phase === "ask" && (
          <div className="absolute inset-0 grid place-items-center rounded-[22px] bg-arena-950/75 text-center">
            <div>
              <div className="font-game text-sm text-[#FF9DB0] sm:text-base">{isStunned ? "TERSETRUM!" : "SALAH!"}</div>
              <div className="text-[11px] font-bold text-ice/85">{isStunned ? "Tunggu sebentar, lalu coba lagi..." : "Tunggu soal berikutnya"}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex h-[100dvh] min-h-[380px] w-full select-none flex-col overflow-hidden bg-arena-950">
      <img src={ARENA_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,46,.68)_0%,rgba(8,18,46,.24)_32%,rgba(8,18,46,.08)_58%,rgba(8,18,46,.8)_100%)]" />

      {/* ---------- HUD ---------- */}
      <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center gap-2 px-2 pt-2 sm:gap-3 sm:px-4 sm:pt-3">
        <IconButton label="Jeda" onClick={() => phase === "ask" && setPaused(true)} active={phase === "ask"}>
          <PauseIcon />
        </IconButton>
        <HudCard def={fighters[0]} hp={hp[0]} tag={mode === 1 ? "KAMU" : "PEMAIN 1"} />
        <TimerRing value={ringVal} max={ringMax} label={monsterRace ? "Serangan Monster" : "Sisa Waktu"} />
        <HudCard def={fighters[1]} hp={hp[1]} tag={mode === 1 ? "MUSUH" : "PEMAIN 2"} right />
        <IconButton label="Suara" onClick={onToggleSound}>
          <SoundIcon on={soundOn} />
        </IconButton>
      </header>

      {/* ---------- Soal ---------- */}
      <div className="relative z-20 mx-auto mt-2 w-full max-w-2xl px-3">
        <div key={`q-${qIndex}-${showQ}`} className="q-pop plate-glass rounded-[22px] px-4 py-1.5 text-center sm:py-2">
          <div className="label text-[10px] text-glow [@media(max-height:520px)]:hidden">
            {sudden ? "Soal Penentuan" : `Soal ${Math.min(qIndex + 1, TOTAL_QUESTIONS)} dari ${TOTAL_QUESTIONS}`} · {level.sub}
          </div>
          <div
            className="tabnum font-game leading-tight text-white"
            style={{ fontSize: "clamp(1.5rem,min(6.2vw,7.5vh),3.5rem)", textShadow: "0 4px 0 rgba(8,18,46,.75), 0 0 30px rgba(56,225,255,.45)" }}
          >
            {showQ ? (
              <>
                {q.a} <span className="text-glow">−</span> {q.b} <span className="text-gold">=</span>{" "}
                <span className={reveal ? "text-[#9CFF7A]" : "text-gold"}>{reveal ? q.answer : "?"}</span>
              </>
            ) : (
              <span className="opacity-60">? − ? = ?</span>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Panggung ---------- */}
      <div className="relative z-10 mx-auto min-h-[110px] w-full max-w-6xl flex-1 px-1">
        <div ref={stageRef} className={`absolute inset-0 overflow-hidden ${stageAnim}`}>
          {/* lantai arena */}
          <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,transparent,rgba(56,225,255,.16))]" />
          <div className="absolute inset-x-[3%] bottom-[2.2%] h-[3px] rounded-full bg-glow/70 shadow-[0_0_18px_4px_rgba(56,225,255,.55)]" />
          <div className={`stage-glow ${glow ? "on" : ""}`} style={{ "--glow": glow ?? "#38E1FF" } as CSSProperties} />

          {size.w > 0 && (
            <>
              <FighterSprite def={fighters[0]} side={0} box={boxes[0]} state={fst[0]} k={fkey[0]} />
              <FighterSprite def={fighters[1]} side={1} box={boxes[1]} state={fst[1]} k={fkey[1]} />
              <div className="pointer-events-none absolute inset-0 z-30">{fx.map(renderFx)}</div>
            </>
          )}

          {flashKey > 0 && <div key={flashKey} className="white-flash" />}

          {/* indikator Robot Monster berpikir */}
          {mode === 1 && phase === "ask" && (
            <div className="absolute right-[3%] top-[3%] z-40 rounded-full border-2 border-white/15 bg-arena-950/80 px-3 py-1 text-[10px] font-extrabold text-ice sm:text-xs">
              {locked[1] ? (
                <span className="text-[#FFB23F]">Monster salah! Giliranmu!</span>
              ) : (
                <span>
                  Monster menghitung<span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              )}
            </div>
          )}

          {/* popup */}
          {popup && (
            <div key={popup.key} className="pointer-events-none absolute inset-x-0 top-[5%] z-[45] flex justify-center px-3">
              <div
                className="popup max-w-[92%] rounded-[22px] border-4 border-white/25 px-5 py-2 text-center shadow-[0_18px_40px_rgba(0,0,0,.45)]"
                style={{ background: TONE_BG[popup.tone] }}
              >
                {popup.tone === "good" && (
                  <div className="-mt-6 mb-0.5">
                    <Stars count={3} size={24} />
                  </div>
                )}
                <div className="sticker sticker-sm leading-tight" style={{ fontSize: "clamp(1.2rem,3.4vw,1.9rem)" }}>
                  {popup.title}
                </div>
                {popup.sub && <div className="text-xs font-extrabold text-white/95 sm:text-sm">{popup.sub}</div>}
              </div>
            </div>
          )}

          {/* banner */}
          {banner && (
            <div key={banner.key} className="pointer-events-none absolute inset-0 z-50 grid place-items-center px-2 text-center">
              {banner.kind === "count" && <div className="banner-count">{banner.text}</div>}
              {banner.kind === "banner" && (
                <div className="banner-pop">
                  <div className="banner-title">{banner.text}</div>
                  {banner.sub && <div className="banner-sub">{banner.sub}</div>}
                </div>
              )}
              {banner.kind === "final" && (
                <div>
                  <div className="banner-final">{banner.text}</div>
                  <div className="banner-final-sub" style={{ "--glow": banner.glow } as CSSProperties}>
                    {banner.sub}
                  </div>
                </div>
              )}
              {banner.kind === "ko" && <div className="ko">{banner.text}</div>}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Tombol jawaban ---------- */}
      <footer className="relative z-20 mx-auto w-full max-w-6xl px-2 pb-3 pt-2 sm:px-4">
        {mode === 1 ? pad(0) : <div className="grid grid-cols-2 gap-2 sm:gap-4">{[pad(0), pad(1)]}</div>}
      </footer>

      {/* ---------- Jeda ---------- */}
      {paused && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-arena-950/85 p-5">
          <div className="plate card-in w-full max-w-sm rounded-[28px] p-7 text-center">
            <div className="sticker" style={{ fontSize: "2.4rem" }}>
              JEDA
            </div>
            <p className="mt-1 text-sm font-bold text-ice/85">Waktu berhenti sementara</p>
            <div className="mt-6 flex flex-col gap-3">
              <ChunkyButton tone="green" size="lg" onClick={() => setPaused(false)}>
                Tetap Main ▶
              </ChunkyButton>
              <ChunkyButton tone="blue" onClick={onRetry}>
                Ulangi Level ⟳
              </ChunkyButton>
              <ChunkyButton tone="purple" onClick={onExit}>
                Pilih Level
              </ChunkyButton>
              <ChunkyButton tone="dark" onClick={onHome}>
                Menu Utama
              </ChunkyButton>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Hasil akhir ---------- */}
      {result &&
        (() => {
          const w = result.winner;
          const win1P = mode === 1 && w === 0;
          const happy = mode === 2 || win1P;
          const winner = fighters[w];
          const title = mode === 1 ? (win1P ? `${level.nama} SELESAI!` : "KAMU KALAH...") : `PEMAIN ${w + 1} MENANG!`;
          const text =
            mode === 1
              ? win1P
                ? `Hebat! Kamu telah menyelesaikan ${TOTAL_QUESTIONS} soal dengan sangat baik!`
                : "Robot Monster menang kali ini. Ayo coba lagi, kamu pasti bisa!"
              : `${winner.nama} menghancurkan lawannya dengan ${winner.jurus}!`;
          const cols: { name: string; s: Stat; player: boolean }[] = [
            { name: mode === 1 ? "KAMU" : "PEMAIN 1", s: result.stats[0], player: true },
            { name: mode === 1 ? "MONSTER" : "PEMAIN 2", s: result.stats[1], player: mode === 2 },
          ];
          return (
            <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-arena-950/65 p-4 backdrop-blur-[3px]">
              {happy && <Confetti />}
              <div className="plate card-in relative w-full max-w-xl rounded-[30px] px-5 pb-6 pt-5 text-center sm:px-8">
                <div className="label text-[11px] text-glow">Hasil Akhir</div>
                <h3 className="sticker mt-1 leading-tight" style={{ fontSize: "clamp(1.6rem,5.4vw,2.6rem)", color: happy ? "#FFE27A" : "#FFC2CC" }}>
                  {title}
                </h3>

                <div className="relative mx-auto mt-2 h-28 w-40 sm:h-36 sm:w-52">
                  <div
                    className="absolute inset-x-6 bottom-0 h-4 rounded-[50%]"
                    style={{ background: `radial-gradient(closest-side, ${winner.beamGlow}aa, transparent)` }}
                  />
                  <img
                    src={winner.sprite}
                    alt={winner.nama}
                    className="fighter-bob absolute inset-0 h-full w-full object-contain"
                    style={{ transform: w === 1 && winner.meta.facesRight ? "scaleX(-1)" : undefined }}
                  />
                </div>

                {result.stars > 0 && (
                  <div className="mt-1">
                    <Stars count={result.stars} size={46} />
                  </div>
                )}
                <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-relaxed text-white/92 sm:text-base">{text}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {cols.map((c) => (
                    <div key={c.name} className="rounded-2xl bg-arena-950/60 px-3 py-3 text-left">
                      <div className="font-game text-xs text-glow">{c.name}</div>
                      <dl className="mt-1.5 space-y-1 text-[12px] font-bold text-ice/85">
                        <div className="flex justify-between">
                          <dt>Benar</dt>
                          <dd className="tabnum text-white">{c.s.hits}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Salah</dt>
                          <dd className="tabnum text-white">{c.s.wrong}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Tercepat</dt>
                          <dd className="tabnum text-white">{fastest(c.s)}</dd>
                        </div>
                        {c.player && (
                          <div className="flex justify-between">
                            <dt>Pangkat</dt>
                            <dd className="text-gold">{rankFor(c.s.hits)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <ChunkyButton tone="blue" onClick={onHome}>
                    Beranda
                  </ChunkyButton>
                  <ChunkyButton tone={win1P && hasNextLevel ? "purple" : "cta"} onClick={onRetry}>
                    {mode === 2 ? "Main Lagi ⟳" : "Ulangi Level ⟳"}
                  </ChunkyButton>
                  {win1P && hasNextLevel && (
                    <ChunkyButton tone="cta" onClick={onNextLevel}>
                      Level Berikutnya ▶
                    </ChunkyButton>
                  )}
                  {mode === 2 && (
                    <ChunkyButton tone="purple" onClick={onExit}>
                      Ganti Level
                    </ChunkyButton>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
