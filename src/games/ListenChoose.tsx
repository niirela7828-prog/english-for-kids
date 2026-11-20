import { useEffect, useMemo, useState } from 'react';
import { choicesFor, distractors, Picture, speakItem, type GameProps } from './common';
import { shuffle } from '../lib/util';
import { PlayButtons } from '../components/Speak';
import { sayText } from './common';

/** שמעי ובחרי – hear a word, tap the right picture. */
export default function ListenChoose({ pool, targets, level, report, onDone }: GameProps) {
  const [q, setQ] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const target = targets[q];

  const options = useMemo(
    () => shuffle([target, ...distractors(pool, target, choicesFor(level) - 1)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  useEffect(() => {
    const t = setTimeout(() => speakItem(target), 350);
    return () => clearTimeout(t);
  }, [target]);

  const choose = (it: typeof target) => {
    if (solved || wrong.includes(it.id)) return;
    if (it.id === target.id) {
      setSolved(true);
      report(q, true);
      speakItem(target, { queue: true });
      setTimeout(() => {
        if (q + 1 >= targets.length) onDone();
        else {
          setQ(q + 1);
          setWrong([]);
          setSolved(false);
        }
      }, 1400);
    } else {
      setWrong((w) => [...w, it.id]);
      report(q, false);
      speakItem(target, { queue: true });
    }
  };

  const showHint = wrong.length >= (level <= 2 ? 1 : 2);
  const cols = options.length <= 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="flex flex-col items-center gap-6">
      <PlayButtons text={sayText(target)} big />
      <div className={`grid w-full max-w-3xl gap-4 ${cols}`}>
        {options.map((it) => {
          const isWrong = wrong.includes(it.id);
          const isRight = solved && it.id === target.id;
          return (
            <button
              key={it.id}
              onClick={() => choose(it)}
              className={`tap card flex aspect-square flex-col items-center justify-center gap-1 ${
                isRight ? 'bg-emerald-100 ring-8 ring-emerald-400' : ''
              } ${isWrong ? 'animate-wiggle opacity-40' : ''} ${showHint && !solved && it.id === target.id ? 'animate-glow' : ''}`}
            >
              <Picture item={it} className={it.kind === 'letter' ? 'text-8xl' : 'text-8xl sm:text-9xl'} />
              {level === 1 && it.kind !== 'letter' && it.kind === 'word' && (
                <span dir="ltr" className="en text-2xl text-slate-400">{it.en}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
