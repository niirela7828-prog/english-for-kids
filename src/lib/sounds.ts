/** Tiny synthesized sound effects (no audio files needed – works offline). */
let ctx: AudioContext | null = null;
let enabled = true;
export const setSoundsEnabled = (on: boolean) => {
  enabled = on;
};

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  correct: () => {
    tone(784, 0, 0.15, 'triangle');
    tone(988, 0.1, 0.15, 'triangle');
    tone(1319, 0.2, 0.3, 'triangle');
  },
  // soft and friendly – never a "buzzer"
  oops: () => {
    tone(440, 0, 0.18, 'sine', 0.1);
    tone(392, 0.15, 0.25, 'sine', 0.1);
  },
  pop: () => {
    tone(900, 0, 0.06, 'square', 0.06);
    tone(1400, 0.03, 0.08, 'sine', 0.1);
  },
  coin: () => {
    tone(988, 0, 0.08, 'square', 0.07);
    tone(1319, 0.08, 0.25, 'square', 0.07);
  },
  win: () => {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle', 0.15));
  },
  flip: () => tone(520, 0, 0.07, 'triangle', 0.07),
};
