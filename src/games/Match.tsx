import { useMemo, useState } from 'react';
import { Picture, speakItem, type GameProps } from './common';
import type { Item } from '../lib/types';
import { shuffle } from '../lib/util';
import { sfx } from '../lib/sounds';

/** התאמה – tap an English word, then its picture. Played in rounds of 3–4 pairs. */
export default function Match({ targets, level, report, onDone }: GameProps) {
  const roundSize = level >= 3 ? 4 : 3;
  const rounds = useMemo(() => {
    const idx = targets.map((_, i) => i);
    const out: number[][] = [];
    for (let i = 0; i < idx.length; i += roundSize) out.push(idx.slice(i, i + roundSize));
    if (out.length > 1 && out[out.length - 1].length < 2) out[out.length - 2].push(...out.pop()!);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [r, setR] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [selWord, setSelWord] = useState<number | null>(null);
  const [selPic, setSelPic] = useState<number | null>(null);
  const [bad, setBad] = useState<number | null>(null);

  const round = rounds[r];
  const words = useMemo(() => shuffle(round), [round]);
  const pics = useMemo(() => shuffle(round), [round]);

  const attempt = (w: number, p: number) => {
    if (w === p) {
      report(w, true);
      speakItem(targets[w]);
      const nd = [...done, w];
      setDone(nd);
      setSelWord(null);
      setSelPic(null);
      if (round.every((i) => nd.includes(i))) {
        setTimeout(() => {
          if (r + 1 >= rounds.length) onDone();
          else {
            setR(r + 1);
            setDone([]);
          }
        }, 1100);
      }
    } else {
      report(w, false);
      setBad(p);
      setTimeout(() => setBad(null), 500);
      setSelPic(null);
    }
  };

  const tapWord = (i: number) => {
    if (done.includes(i)) return;
    sfx.tap();
    speakItem(targets[i]);
    if (selPic !== null) attempt(i, selPic);
    else setSelWord(i);
  };
  const tapPic = (i: number) => {
    if (done.includes(i)) return;
    sfx.tap();
    if (selWord !== null) attempt(selWord, i);
    else setSelPic(i);
  };

  const label = (it: Item) => (it.kind === 'letter' ? `${it.en} ${it.lower}` : it.en);
  const pic = (it: Item) => (it.kind === 'letter' ? { ...it, kind: 'word' as const, emoji: it.example!.emoji } : it);
  const long = targets[0]?.kind === 'sentence' || targets[0]?.kind === 'qa';

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-4 sm:gap-8">
      <div className="flex flex-col gap-4">
        {words.map((i) => (
          <button
            key={i}
            onClick={() => tapWord(i)}
            className={`tap card flex min-h-24 items-center justify-center px-3 py-3 ${
              done.includes(i) ? 'bg-emerald-100 opacity-50' : selWord === i ? 'bg-violet-100 ring-8 ring-violet-400' : ''
            }`}
          >
            <span dir="ltr" className={`en font-bold text-slate-800 ${long ? 'text-2xl' : 'text-4xl'}`}>
              {label(targets[i])}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {pics.map((i) => (
          <button
            key={i}
            onClick={() => tapPic(i)}
            className={`tap card flex min-h-24 items-center justify-center ${
              done.includes(i) ? 'bg-emerald-100 opacity-50' : selPic === i ? 'bg-violet-100 ring-8 ring-violet-400' : ''
            } ${bad === i ? 'animate-wiggle' : ''} ${level === 1 && selWord === i ? 'animate-glow' : ''}`}
          >
            <Picture item={pic(targets[i])} className="text-6xl" />
          </button>
        ))}
      </div>
    </div>
  );
}
