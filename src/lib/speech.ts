/**
 * Text-to-speech helpers on top of the Web Speech API.
 * Picks the best English voice on the device (with fallbacks) and a Hebrew voice if one exists.
 */
type Listener = () => void;

const synth: SpeechSynthesis | undefined = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
let voices: SpeechSynthesisVoice[] = [];
let enVoice: SpeechSynthesisVoice | null = null;
let heVoice: SpeechSynthesisVoice | null = null;
const listeners = new Set<Listener>();

export const EN_RATE = 0.8;
export const SLOW_RATE = 0.5;

function scoreEnglish(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('en')) return -1;
  const name = v.name.toLowerCase();
  let s = 0;
  if (lang === 'en-us') s += 40;
  else if (lang === 'en-gb') s += 30;
  else s += 15;
  // Higher quality voices on common platforms
  if (/natural|neural|premium|enhanced|online/.test(name)) s += 25;
  if (/google/.test(name)) s += 20;
  if (/samantha|ava|allison|susan|zira|aria|jenny|serena|karen|moira|tessa/.test(name)) s += 15;
  // Avoid novelty / robotic voices
  if (/bad news|bells|boing|bubbles|cellos|whisper|zarvox|trinoids|organ|hysterical|albert|jester|superstar|wobble|grandpa|grandma|eloquence|espeak/.test(name)) s -= 60;
  if (v.localService) s += 5; // works offline
  return s;
}

function pickVoices() {
  if (!synth) return;
  voices = synth.getVoices();
  const en = voices.map((v) => [v, scoreEnglish(v)] as const).filter(([, s]) => s >= 0).sort((a, b) => b[1] - a[1]);
  enVoice = en[0]?.[0] ?? null;
  heVoice =
    voices.find((v) => /^(he|iw)([-_]|$)/i.test(v.lang) && v.localService) ??
    voices.find((v) => /^(he|iw)([-_]|$)/i.test(v.lang)) ??
    null;
  listeners.forEach((l) => l());
}

if (synth) {
  pickVoices();
  synth.addEventListener?.('voiceschanged', pickVoices);
  // Some browsers load voices lazily and never fire the event
  setTimeout(pickVoices, 500);
  setTimeout(pickVoices, 2000);
}

export const speechSupported = () => !!synth;
export const hasHebrewVoice = () => !!heVoice;
export const englishVoiceName = () => enVoice?.name ?? null;
export const hebrewVoiceName = () => heVoice?.name ?? null;

export function onVoicesChanged(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

interface SpeakOpts {
  rate?: number;
  /** queue after current speech instead of interrupting */
  queue?: boolean;
  onEnd?: () => void;
}

function say(text: string, lang: string, voice: SpeechSynthesisVoice | null, opts: SpeakOpts) {
  if (!synth) {
    opts.onEnd?.();
    return;
  }
  if (!opts.queue) synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? lang;
  if (voice) u.voice = voice;
  u.rate = opts.rate ?? 1;
  u.pitch = 1.05;
  if (opts.onEnd) {
    u.onend = () => opts.onEnd?.();
    u.onerror = () => opts.onEnd?.();
  }
  // Chrome sometimes stays paused after cancel()
  synth.resume();
  synth.speak(u);
}

export function speakEn(text: string, opts: SpeakOpts & { slow?: boolean } = {}) {
  say(text, 'en-US', enVoice, { ...opts, rate: opts.rate ?? (opts.slow ? SLOW_RATE : EN_RATE) });
}

let hebrewEnabled = true;
export const setHebrewEnabled = (on: boolean) => {
  hebrewEnabled = on;
};

/** Speaks Hebrew only when a Hebrew voice exists (otherwise silently skipped). */
export function speakHe(text: string, opts: SpeakOpts = {}) {
  if (!heVoice || !hebrewEnabled) {
    opts.onEnd?.();
    return;
  }
  say(text, 'he-IL', heVoice, { ...opts, rate: opts.rate ?? 0.95 });
}

export function stopSpeech() {
  synth?.cancel();
}
