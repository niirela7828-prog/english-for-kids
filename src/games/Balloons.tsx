import { useEffect, useMemo, useState } from 'react';
import { choicesFor, distractors, sayText, speakItem, type GameProps } from './common';
import { shuffle } from '../lib/util';
import { sfx } from '../lib/sounds';
import { PlayButtons } from '../components/Speak';

const COLORS = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];

/** בלונים – hear a letter/word and pop the right balloon. No time pressure: balloons keep floating. */
export default function Balloons({ pool, targets, level, report, onDone }: GameProps) {
  const [q, setQ] = useState(0);
  const [popped, setPopped] = useState<string | null>(null);
  const [wiggle, setWiggle] = useState<string | null>(null);
  const target = targets[q];

  const balloons = useMemo(() => {
    const items = shuffle([target, ...distractors(pool, target, choicesFor(level))]);
    return items.map((it, i) => ({
      it,
      color: COLORS[(i + q) % COLORS.length],
      left: (i + 0.5) * (100 / items.length),
      dur: 9 + Math.random() * 3,
      delay: -Math.random() * 8,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => speakItem(target), 350);
    return () => clearTimeout(t);
  }, [target]);

  const tap = (id: string) => {
    if (popped) return;
    if (id === target.id) {
      sfx.pop();
      setPopped(id);
      report(q, true);
      speakItem(target, { queue: true });
      setTimeout(() => {
        setPopped(null);
        if (q + 1 >= targets.length) onDone();
        else setQ(q + 1);
      }, 1200);
    } else {
      setWiggle(id);
      setTimeout(() => setWiggle(null), 500);
      report(q, false);
      speakItem(target, { queue: true });
    }
  };

  const showEmoji = target.kind !== 'letter' && level < 3;

  return (
    <div className="flex flex-col items-center gap-3">
      <PlayButtons text={sayText(target)} />
      <div className="relative h-[60vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-200 to-sky-50">
        <div className="emoji absolute left-6 top-6 text-6xl opacity-80">☁️</div>
        <div className="emoji absolute right-10 top-24 text-5xl opacity-70">☁️</div>
        {balloons.map((b) => (
          <button
            key={`${q}-${b.it.id}`}
            onClick={() => tap(b.it.id)}
            className="balloon absolute bottom-0"
            style={{ left: `${b.left}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          >
            <span
              className={`relative flex h-36 w-28 flex-col items-center justify-center rounded-[50%] text-white shadow-lg transition-transform duration-300 ${
                popped === b.it.id ? 'scale-150 opacity-0' : ''
              } ${wiggle === b.it.id ? 'animate-wiggle' : ''}`}
              style={{ background: `radial-gradient(circle at 35% 30%, #ffffffaa, ${b.color} 40%)` }}
            >
              {showEmoji && <span className="emoji text-4xl">{b.it.emoji}</span>}
              <span dir="ltr" className={`en font-bold drop-shadow ${b.it.kind === 'letter' ? 'text-6xl' : 'text-2xl'}`}>
                {b.it.kind === 'letter' ? `${b.it.en}${b.it.lower}` : b.it.en}
              </span>
              <span className="absolute -bottom-2 h-3 w-3 rotate-45" style={{ background: b.color }} />
            </span>
            <span className="mx-auto block h-16 w-0.5 bg-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
