import { useEffect, useMemo, useState } from 'react';
import { speakItem, type GameProps } from './common';
import { shuffle } from '../lib/util';
import { sfx } from '../lib/sounds';
import { PlayButtons } from '../components/Speak';
import { useStore } from '../lib/store';

/**
 * Shared engine for "בני את המילה" (letters of a word) and "סדרי את המשפט" (words of a sentence).
 * Tap the pieces in order – no dragging.
 */
export function Sequence({ targets, level, report, onDone, mode }: GameProps & { mode: 'build' | 'order' }) {
  const [q, setQ] = useState(0);
  const target = targets[q];
  const text = mode === 'order' && target.kind === 'qa' ? target.en : target.en;
  const parts = useMemo(() => (mode === 'build' ? text.split('') : text.split(' ')), [text, mode]);
  const prefilled = mode === 'order' && level === 2 && parts.length > 2 ? 1 : 0;
  const [placed, setPlaced] = useState(prefilled);
  const [bad, setBad] = useState<number | null>(null);
  const { profile } = useStore();

  const tiles = useMemo(() => {
    let t = parts.map((p, i) => ({ p, i }));
    if (mode === 'build' && level >= 3) {
      const extra = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => !parts.includes(c));
      t = [...t, ...shuffle(extra).slice(0, 2).map((p, k) => ({ p, i: 100 + k }))];
    }
    let s = shuffle(t);
    for (let k = 0; k < 5 && s.every((x, j) => x.i === j); k++) s = shuffle(t);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const [used, setUsed] = useState<number[]>([]);

  useEffect(() => {
    setPlaced(prefilled);
    setUsed(Array.from({ length: prefilled }, (_, i) => i));
    const t = setTimeout(() => speakItem(target), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const tap = (tile: { p: string; i: number }) => {
    if (used.includes(tile.i) || placed >= parts.length) return;
    // identical letters/words are interchangeable
    if (tile.p.toLowerCase() === parts[placed].toLowerCase()) {
      sfx.tap();
      const nu = [...used, tile.i];
      setUsed(nu);
      const np = placed + 1;
      setPlaced(np);
      if (mode === 'build') speakItem({ ...target, en: tile.p, kind: 'letter' });
      if (np === parts.length) {
        report(q, true);
        speakItem(target, { queue: true });
        setTimeout(() => {
          if (q + 1 >= targets.length) onDone();
          else setQ(q + 1);
        }, 1700);
      }
    } else {
      setBad(tile.i);
      setTimeout(() => setBad(null), 500);
      report(q, false);
    }
  };

  const ghost = (i: number) => level === 1 || (mode === 'build' && level === 2 && i === 0);
  const showTr = profile?.settings.translit ?? true;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4">
        <span className="emoji text-8xl">{target.emoji}</span>
        <PlayButtons text={target.en} />
      </div>
      {mode === 'order' && (
        <p className="text-2xl text-slate-500">
          {target.he}
          {showTr && <span className="block text-center text-lg text-violet-500">{target.tr}</span>}
        </p>
      )}
      {/* slots */}
      <div dir="ltr" className="flex min-h-24 flex-wrap justify-center gap-2 rounded-3xl bg-white/70 p-3">
        {parts.map((p, i) => (
          <span
            key={i}
            className={`en grid min-h-20 place-items-center rounded-2xl border-4 border-dashed font-bold ${
              mode === 'build' ? 'w-16 text-5xl sm:w-20' : 'min-w-20 px-3 text-3xl'
            } ${i < placed ? 'animate-pop border-emerald-400 bg-emerald-50 text-slate-800' : 'border-violet-200 text-slate-300'}`}
          >
            {i < placed ? p : ghost(i) ? p : ''}
          </span>
        ))}
      </div>
      {/* tiles */}
      <div dir="ltr" className="flex flex-wrap justify-center gap-3">
        {tiles.map((t) => (
          <button
            key={`${q}-${t.i}`}
            onClick={() => tap(t)}
            disabled={used.includes(t.i)}
            className={`tap en rounded-2xl bg-amber-300 font-bold text-slate-800 shadow-[0_6px_0_#d97706] transition-opacity ${
              mode === 'build' ? 'h-20 w-20 text-5xl' : 'h-20 px-5 text-3xl'
            } ${used.includes(t.i) ? 'invisible' : ''} ${bad === t.i ? 'animate-wiggle bg-rose-200' : ''}`}
          >
            {t.p}
          </button>
        ))}
      </div>
    </div>
  );
}

export const BuildWord = (p: GameProps) => <Sequence {...p} mode="build" />;
export const SentenceOrder = (p: GameProps) => <Sequence {...p} mode="order" />;
