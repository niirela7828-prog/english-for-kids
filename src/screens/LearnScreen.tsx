import { useEffect, useState } from 'react';
import { useProfile } from '../lib/store';
import { getUnit } from '../lib/curriculum';
import type { Item, Unit } from '../lib/types';
import { Coins, ProgressDots, TopBar } from '../components/ui';
import { EnText, Instruction, PlayButtons } from '../components/Speak';
import { speakEn } from '../lib/speech';
import { sfx } from '../lib/sounds';
import { confetti } from '../components/Confetti';
import { MascotSays } from '../components/Mascot';

/** Speech for a flashcard: letters say the letter and the example word. */
const cardSpeech = (it: Item) => (it.kind === 'letter' ? `${it.en}. ${it.example!.en}.` : it.en);

export function LearnCards({ unit, onDone }: { unit: Unit; onDone: () => void }) {
  const { update } = useProfile();
  const [i, setI] = useState(0);
  const items = unit.items;
  const it = items[i];
  const last = i === items.length - 1;

  useEffect(() => {
    const t = setTimeout(() => speakEn(cardSpeech(it)), 300);
    return () => clearTimeout(t);
  }, [it]);

  const finish = () => {
    sfx.win();
    confetti(true);
    update((p) => ({ ...p, learned: { ...p.learned, [unit.id]: true } }));
    onDone();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-3">
      <Instruction text={unit.story ? 'הקשיבי לסיפור. הקישי על המשפט כדי לשמוע שוב' : 'הקשיבי וחזרי אחריי בקול'} />
      <ProgressDots done={i + 1} total={items.length} />
      <div key={it.id} className="card flex w-full animate-pop flex-col items-center gap-3 p-4">
        {it.kind === 'letter' ? (
          <>
            <span dir="ltr" role="button" onClick={() => speakEn(`${it.en}.`)} className="en text-[7.5rem] font-bold leading-none text-violet-700">
              {it.en}
              <span className="text-pink-500">{it.lower}</span>
            </span>
            <LetterInfo it={it} />
          </>
        ) : (
          <>
            <span className="emoji text-[6.5rem] leading-none" role="button" onClick={() => speakEn(it.en)}>
              {it.emoji}
            </span>
            <EnText text={it.en} tr={it.tr} he={it.he} className={it.kind === 'word' ? 'text-7xl' : 'text-5xl text-center'} />
            {it.q && (
              <div className="w-full rounded-3xl bg-violet-50 p-3">
                <p className="mb-1 text-center text-xl text-violet-500">❓ השאלה:</p>
                <EnText text={it.q.en} tr={it.q.tr} he={it.q.he} className="text-3xl" />
              </div>
            )}
          </>
        )}
        <PlayButtons text={cardSpeech(it)} big />
      </div>
      <div className="flex w-full max-w-md justify-between gap-4">
        <button
          aria-label="הקודם"
          disabled={i === 0}
          onClick={() => {
            sfx.tap();
            setI(i - 1);
          }}
          className="tap h-20 w-20 rounded-full bg-white text-5xl shadow disabled:opacity-30"
        >
          ➡️
        </button>
        <button
          aria-label={last ? 'סיימתי' : 'הבא'}
          onClick={() => {
            sfx.tap();
            if (last) finish();
            else setI(i + 1);
          }}
          className={`tap h-20 flex-1 rounded-full text-5xl shadow-lg ${last ? 'bg-emerald-400' : 'bg-violet-400'}`}
        >
          {last ? '🎉' : '⬅️'}
        </button>
      </div>
    </div>
  );
}

function LetterInfo({ it }: { it: Item }) {
  const { p } = useProfile();
  const ex = it.example!;
  return (
    <>
      <p className="text-2xl text-slate-600">
        {p.settings.translit && (
          <>
            שם האות: <b className="text-violet-600">{it.tr}</b> ·{' '}
          </>
        )}
        צליל: <b className="text-pink-600">{it.sound}</b>
      </p>
      <button onClick={() => speakEn(ex.en)} className="tap flex items-center gap-4 rounded-3xl bg-amber-50 px-6 py-3">
        <span className="emoji text-7xl">{ex.emoji}</span>
        <EnText text={ex.en} tr={ex.tr} he={ex.he} className="text-5xl" speak={false} />
      </button>
    </>
  );
}

export function LearnScreen({ unitId, onDone }: { unitId: string; onDone: () => void }) {
  const { p } = useProfile();
  const unit = getUnit(unitId);
  const [finished, setFinished] = useState(false);
  return (
    <div className="min-h-full pb-8">
      <TopBar title={unit.title} emoji={unit.emoji} right={<Coins n={p.coins} />} />
      {finished ? (
        <div className="flex flex-col items-center gap-6 pt-10">
          <MascotSays text="כל הכבוד! עכשיו בואי נשחק 🎮" mood="cheer" size={140} />
          <button onClick={onDone} className="tap h-24 w-48 rounded-full bg-emerald-400 text-5xl shadow-lg">
            ✔️
          </button>
        </div>
      ) : (
        <LearnCards unit={unit} onDone={() => setFinished(true)} />
      )}
    </div>
  );
}
