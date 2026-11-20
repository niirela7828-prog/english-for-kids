import { useEffect, useMemo, useState } from 'react';
import { choicesFor, distractors, speakItem, type GameProps } from './common';
import { shuffle } from '../lib/util';
import { speakEn } from '../lib/speech';
import { PlayButtons, EnText } from '../components/Speak';

/** עני על השאלה – hear a question, pick the matching answer. */
export default function QA({ pool, targets, level, report, onDone }: GameProps) {
  const [q, setQ] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const target = targets[q];
  const question = target.q!;

  const options = useMemo(
    () => shuffle([target, ...distractors(pool, target, Math.min(choicesFor(level), 3) - 1 + (level >= 3 ? 1 : 0))]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  useEffect(() => {
    const t = setTimeout(() => speakEn(question.en), 350);
    return () => clearTimeout(t);
  }, [question.en]);

  const choose = (id: string) => {
    if (solved || wrong.includes(id)) return;
    if (id === target.id) {
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
      }, 1900);
    } else {
      setWrong((w) => [...w, id]);
      report(q, false);
      speakEn(question.en, { queue: true });
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="card flex w-full max-w-2xl flex-col items-center gap-3 p-5">
        <span className="emoji text-5xl">❓</span>
        <EnText text={question.en} tr={question.tr} he={question.he} className="text-4xl" />
        <PlayButtons text={question.en} />
      </div>
      <div className="grid w-full max-w-2xl gap-3">
        {options.map((it) => (
          <button
            key={it.id}
            onClick={() => choose(it.id)}
            className={`tap card flex min-h-20 items-center gap-4 px-5 py-3 ${
              solved && it.id === target.id ? 'bg-emerald-100 ring-8 ring-emerald-400' : ''
            } ${wrong.includes(it.id) ? 'animate-wiggle opacity-40' : ''} ${
              level === 1 && wrong.length > 0 && !solved && it.id === target.id ? 'animate-glow' : ''
            }`}
          >
            <span className="emoji text-5xl">{it.emoji}</span>
            <span dir="ltr" className="en flex-1 text-left text-3xl font-bold text-slate-800">
              {it.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
