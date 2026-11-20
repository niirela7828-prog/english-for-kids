import type { Item } from '../lib/types';
import { speakEn } from '../lib/speech';

export interface GameProps {
  pool: Item[];
  targets: Item[];
  /** adaptive difficulty 1..3 (fewer choices + more hints at 1) */
  level: number;
  /** report an attempt on question `q` (index into targets). First report per question decides accuracy. */
  report: (q: number, correct: boolean) => void;
  /** finished all questions; optional accuracy override (e.g. memory game) */
  onDone: (accuracy?: number) => void;
}

/** What the TTS says for an item. Letters get a period so engines say "ay", not "uh". */
export const sayText = (it: Item) => (it.kind === 'letter' ? `${it.en}.` : it.en);
export const speakItem = (it: Item, opts: { queue?: boolean; slow?: boolean; onEnd?: () => void } = {}) =>
  speakEn(sayText(it), opts);

/** Number of answer choices by level. */
export const choicesFor = (level: number) => (level <= 1 ? 2 : level === 2 ? 3 : 4);

/** Big picture/visual for an item: emoji, or the letter itself for letters. */
export function Picture({ item, className = 'text-7xl' }: { item: Item; className?: string }) {
  if (item.kind === 'letter')
    return (
      <span dir="ltr" className={`en font-bold text-violet-700 ${className}`}>
        {item.en}
        <span className="text-[0.7em] text-pink-500">{item.lower}</span>
      </span>
    );
  return <span className={`emoji ${className}`}>{item.emoji}</span>;
}

/** Distractors: different items with different visuals. */
export function distractors(pool: Item[], target: Item, n: number): Item[] {
  const seen = new Set([target.emoji, target.en]);
  const out: Item[] = [];
  for (const it of [...pool].sort(() => Math.random() - 0.5)) {
    if (out.length >= n) break;
    if (seen.has(it.emoji) || seen.has(it.en)) continue;
    seen.add(it.emoji);
    seen.add(it.en);
    out.push(it);
  }
  return out;
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
