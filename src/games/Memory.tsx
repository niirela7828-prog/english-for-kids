import { useMemo, useState } from 'react';
import { speakItem, type GameProps } from './common';
import { shuffle } from '../lib/util';
import { sfx } from '../lib/sounds';
import type { Item } from '../lib/types';

interface Card {
  key: string;
  q: number;
  face: 'text' | 'pic';
}

/** זיכרון – flip cards to find word ↔ picture pairs (letters: capital ↔ small letter). */
export default function Memory({ targets, report, onDone }: GameProps) {
  const cards = useMemo<Card[]>(
    () => shuffle(targets.flatMap((_, q) => [{ key: `${q}t`, q, face: 'text' as const }, { key: `${q}p`, q, face: 'pic' as const }])),
    [targets],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const flip = (c: Card) => {
    if (busy || open.includes(c.key) || found.includes(c.q)) return;
    sfx.flip();
    const it = targets[c.q];
    speakItem(it);
    const now = [...open, c.key];
    setOpen(now);
    if (now.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = now.map((k) => cards.find((x) => x.key === k)!);
    if (a.q === b.q) {
      report(a.q, true);
      const nf = [...found, a.q];
      setFound(nf);
      setOpen([]);
      if (nf.length === targets.length) {
        const pairs = targets.length;
        const m = moves + 1;
        setTimeout(() => onDone(m <= pairs * 2 ? 1 : m <= pairs * 3 ? 0.7 : 0.5), 900);
      }
    } else {
      setBusy(true);
      setTimeout(() => {
        sfx.flip();
        setOpen([]);
        setBusy(false);
      }, 1100);
    }
  };

  const face = (it: Item, f: Card['face']) => {
    if (it.kind === 'letter')
      return (
        <span dir="ltr" className={`en font-bold ${f === 'text' ? 'text-violet-700' : 'text-pink-500'} text-6xl`}>
          {f === 'text' ? it.en : it.lower}
        </span>
      );
    return f === 'text' ? (
      <span dir="ltr" className="en px-1 text-2xl font-bold text-slate-800 sm:text-3xl">{it.en}</span>
    ) : (
      <span className="emoji text-6xl">{it.emoji}</span>
    );
  };

  const cols = cards.length <= 6 ? 'grid-cols-3' : cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4';
  return (
    <div className={`mx-auto grid w-full max-w-3xl gap-3 sm:gap-4 ${cols}`} dir="ltr">
      {cards.map((c) => {
        const up = open.includes(c.key) || found.includes(c.q);
        return (
          <button key={c.key} onClick={() => flip(c)} className="tap aspect-[3/4] [perspective:800px]">
            <span className={`flip relative block h-full w-full ${up ? 'flipped' : ''}`}>
              <span className="flip-face absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-violet-400 to-pink-400 text-5xl shadow-lg">
                ❓
              </span>
              <span
                className={`flip-face flip-back absolute inset-0 grid place-items-center rounded-3xl shadow-lg ${
                  found.includes(c.q) ? 'bg-emerald-100 ring-4 ring-emerald-400' : 'bg-white'
                }`}
              >
                {face(targets[c.q], c.face)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
