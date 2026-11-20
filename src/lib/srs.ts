import type { Item, Profile, WordStat } from './types';
import { DAY, shuffle } from './util';

/** Leitner box intervals: box 0 = now, then 1, 2, 4, 8 days */
const INTERVALS = [0, 1 * DAY, 2 * DAY, 4 * DAY, 8 * DAY];

export const emptyStat = (): WordStat => ({ c: 0, w: 0, box: 0, due: 0 });

export function updateStat(stat: WordStat | undefined, correct: boolean, now = Date.now()): WordStat {
  const s = { ...(stat ?? emptyStat()) };
  if (correct) {
    s.c++;
    s.box = Math.min(s.box + 1, INTERVALS.length - 1);
  } else {
    s.w++;
    s.box = 0;
  }
  s.due = now + INTERVALS[s.box];
  return s;
}

/** Priority: higher = should be practiced sooner. */
export function priority(stat: WordStat | undefined, now = Date.now()): number {
  if (!stat) return 50; // never seen
  let p = 0;
  if (stat.due <= now) p += 30;
  p += (4 - stat.box) * 8;
  p += Math.min(stat.w * 6, 30);
  return p;
}

/**
 * Picks `n` targets from `pool`, preferring items with mistakes / due for review,
 * with some randomness. Repeats items when the pool is small (never back-to-back).
 */
export function pickTargets(pool: Item[], n: number, profile: Profile): Item[] {
  const ranked = shuffle(pool).sort(
    (a, b) => priority(profile.words[b.id]) + Math.random() * 15 - (priority(profile.words[a.id]) + Math.random() * 15),
  );
  const out: Item[] = [];
  while (out.length < n && ranked.length) {
    for (const it of ranked) {
      if (out.length >= n) break;
      if (out[out.length - 1]?.id === it.id) continue;
      out.push(it);
    }
  }
  return out;
}

/** Items from already-practiced units that are due or were hard. */
export function reviewItems(profile: Profile, candidates: Item[], max: number): Item[] {
  const now = Date.now();
  return candidates
    .filter((it) => {
      const s = profile.words[it.id];
      return s && (s.due <= now || s.w > s.c);
    })
    .sort((a, b) => priority(profile.words[b.id], now) - priority(profile.words[a.id], now))
    .slice(0, max);
}

/** Words the child finds hardest (for the parents area). */
export function hardItems(profile: Profile, all: Item[], max = 12): { item: Item; stat: WordStat }[] {
  return all
    .map((item) => ({ item, stat: profile.words[item.id] }))
    .filter((x): x is { item: Item; stat: WordStat } => !!x.stat && x.stat.w > 0)
    .sort((a, b) => b.stat.w / (b.stat.c + b.stat.w) - a.stat.w / (a.stat.c + a.stat.w) || b.stat.w - a.stat.w)
    .slice(0, max);
}
