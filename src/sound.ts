let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function soundEnabled() {
  return enabled;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    // kompresor lembut agar ledakan yang bertumpuk tidak pecah
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0, slideTo?: number) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur: number, gain: number, delay = 0, f0 = 2000, f1 = 200, type: BiquadFilterType = "lowpass", q = 0.8) {
  const c = ac();
  if (!c || !master) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

export type Sfx =
  | "click"
  | "correct"
  | "wrong"
  | "laser"
  | "hit"
  | "smoke"
  | "explosion"
  | "bigboom"
  | "powerup"
  | "megalaser"
  | "vanish"
  | "ko"
  | "beep"
  | "go"
  | "zap"
  | "whoosh"
  | "land"
  | "win"
  | "lose"
  | "start";

export function play(name: Sfx) {
  if (!enabled) return;
  switch (name) {
    case "click":
      tone(520, 0.07, "triangle", 0.16);
      tone(780, 0.05, "square", 0.05, 0.01);
      break;
    case "correct":
      tone(660, 0.12, "triangle", 0.18);
      tone(880, 0.13, "triangle", 0.16, 0.08);
      tone(1180, 0.16, "triangle", 0.14, 0.16);
      break;
    case "wrong":
      tone(240, 0.18, "sawtooth", 0.12, 0, 150);
      tone(160, 0.22, "square", 0.08, 0.1, 90);
      break;
    case "laser":
      tone(1500, 0.32, "sawtooth", 0.11, 0, 220);
      tone(900, 0.34, "square", 0.05, 0.02, 160);
      break;
    case "hit":
      tone(190, 0.2, "square", 0.14, 0, 60);
      noise(0.14, 0.2, 0, 3200, 700);
      break;
    case "smoke":
      noise(0.8, 0.07, 0, 1200, 300, "bandpass", 0.6);
      break;
    case "explosion":
      noise(0.8, 0.34, 0, 2600, 110);
      tone(110, 0.55, "sine", 0.34, 0, 38);
      break;
    case "bigboom":
      noise(1.7, 0.5, 0, 3200, 60);
      tone(90, 1.3, "sine", 0.5, 0, 28);
      noise(1, 0.22, 0.25, 1400, 70);
      break;
    case "powerup":
      tone(160, 1.75, "sawtooth", 0.05, 0, 1300);
      tone(220, 1.75, "triangle", 0.08, 0, 1760);
      tone(330, 1.6, "sine", 0.05, 0.1, 2400);
      break;
    case "megalaser":
      tone(110, 1.5, "sawtooth", 0.11, 0, 95);
      tone(220, 1.5, "square", 0.045, 0, 190);
      noise(1.5, 0.15, 0, 3600, 1800, "bandpass", 1.2);
      tone(1900, 0.38, "sawtooth", 0.09, 0, 260);
      break;
    case "vanish":
      noise(1.3, 0.1, 0, 7000, 1500, "highpass");
      tone(1200, 1.2, "triangle", 0.05, 0, 150);
      break;
    case "ko":
      tone(330, 0.16, "square", 0.13);
      tone(440, 0.16, "square", 0.13, 0.15);
      tone(660, 0.5, "square", 0.15, 0.3);
      noise(0.6, 0.12, 0.3, 5000, 800, "highpass");
      break;
    case "beep":
      tone(660, 0.12, "square", 0.12);
      break;
    case "go":
      tone(990, 0.35, "square", 0.13);
      tone(1320, 0.35, "triangle", 0.1);
      break;
    case "zap":
      [0, 0.05, 0.1, 0.15].forEach((d, i) => tone(500 + i * 260, 0.05, "square", 0.07, d));
      break;
    case "whoosh":
      noise(0.7, 0.16, 0, 300, 2800, "bandpass", 1.4);
      break;
    case "land":
      tone(120, 0.3, "sine", 0.4, 0, 40);
      noise(0.25, 0.14, 0, 900, 120);
      break;
    case "win":
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.26, "triangle", 0.2, i * 0.12));
      break;
    case "lose":
      [392, 349, 294, 233].forEach((f, i) => tone(f, 0.32, "sawtooth", 0.13, i * 0.16));
      break;
    case "start":
      tone(440, 0.1, "triangle", 0.18);
      tone(660, 0.12, "triangle", 0.18, 0.1);
      tone(880, 0.2, "triangle", 0.2, 0.2);
      break;
  }
}
