import { useState } from 'react';
import { useProfile } from '../lib/store';
import { useNav } from '../lib/nav';
import { ALL_UNITS, GAMES } from '../lib/curriculum';
import { frontierUnit, unitPassed } from '../lib/progress';
import { reviewItems } from '../lib/srs';
import { DAILY_BONUS, newBadges } from '../lib/rewards';
import type { GameId, Item, Profile, Unit } from '../lib/types';
import { pick, todayKey } from '../lib/util';
import { GamePlay } from './GamePlay';
import { LearnCards } from './LearnScreen';
import { Coins, TopBar } from '../components/ui';
import { MascotSays } from '../components/Mascot';
import { confetti } from '../components/Confetti';
import { sfx } from '../lib/sounds';
import { speakHe } from '../lib/speech';

type Step =
  | { type: 'learn'; unit: Unit }
  | { type: 'game'; game: GameId; pool: Item[]; unitId?: string; review?: boolean };

/** ~10 minutes: new material from the current unit + spaced review of older words. */
function planLesson(p: Profile): Step[] {
  const passed = ALL_UNITS.filter((u) => unitPassed(p, u));
  const cur = frontierUnit(p) ?? pick(ALL_UNITS);
  const steps: Step[] = [];

  if (!p.learned[cur.id]) steps.push({ type: 'learn', unit: cur });
  steps.push({ type: 'game', game: cur.games[0], pool: cur.items, unitId: cur.id });

  // Review: words that were hard or are due, from units already passed (same kind → fair distractors)
  const seen = passed.flatMap((u) => u.items).filter((i) => p.words[i.id]);
  const due = reviewItems(p, seen, 8);
  if (due.length) {
    const kind = due[0].kind;
    const pool = seen.filter((i) => i.kind === kind);
    if (pool.length >= 4) steps.push({ type: 'game', game: kind === 'letter' ? 'balloons' : 'listen', pool, review: true });
  }

  steps.push({ type: 'game', game: cur.games[1] ?? cur.games[0], pool: cur.items, unitId: cur.id });
  const third = cur.games[2] ?? cur.games[0];
  // mix the new unit with older words for the last game when possible
  const sameKindOld = seen.filter((i) => i.kind === cur.items[0].kind);
  const mixPool = sameKindOld.length >= 4 && third !== 'build' && third !== 'order' ? [...cur.items, ...sameKindOld.slice(0, 8)] : cur.items;
  steps.push({ type: 'game', game: third, pool: mixPool, unitId: mixPool === cur.items ? cur.id : undefined });
  return steps;
}

export function DailyLesson() {
  const { p, update } = useProfile();
  const { home } = useNav();
  const [steps] = useState(() => planLesson(p));
  const [i, setI] = useState(-1);
  const [finished, setFinished] = useState(false);

  const next = () => {
    if (i + 1 < steps.length) setI(i + 1);
    else {
      const d = todayKey();
      const already = !!p.daily[d];
      const bonus = already ? 0 : DAILY_BONUS;
      const nextP = { ...p, daily: { ...p.daily, [d]: true } };
      const earned = newBadges(nextP);
      update((prof) => ({
        ...prof,
        coins: prof.coins + bonus,
        daily: { ...prof.daily, [d]: true },
        badges: [...new Set([...prof.badges, ...earned.map((b) => b.id)])],
      }));
      setFinished(true);
      sfx.win();
      confetti(true);
      speakHe('וואו! סיימת את שיעור היום! את אלופה!');
    }
  };

  const header = `שיעור היום`;
  if (finished)
    return (
      <div className="min-h-full">
        <TopBar title={header} emoji="☀️" right={<Coins n={p.coins} />} />
        <div className="flex flex-col items-center gap-6 px-4 pt-10 text-center">
          <MascotSays text="סיימת את שיעור היום! 🏆" mood="cheer" size={150} />
          <p className="text-3xl font-bold text-amber-600">🪙 +{DAILY_BONUS}</p>
          <button onClick={home} className="tap h-24 w-48 rounded-full bg-emerald-400 text-5xl shadow-lg">
            🗺️
          </button>
        </div>
      </div>
    );

  if (i < 0)
    return (
      <div className="min-h-full">
        <TopBar title={header} emoji="☀️" right={<Coins n={p.coins} />} />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pt-6">
          <MascotSays text={`היי ${p.name}! מוכנה לשיעור?`} mood="wave" size={130} />
          <div className="flex flex-wrap justify-center gap-3">
            {steps.map((s, k) => (
              <span key={k} className="emoji grid h-20 w-20 place-items-center rounded-3xl bg-white text-5xl shadow">
                {s.type === 'learn' ? '👀' : s.review ? '🔁' : GAMES[s.game].emoji}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              sfx.tap();
              setI(0);
            }}
            className="tap h-24 w-64 animate-glow rounded-full bg-gradient-to-l from-pink-400 to-violet-500 text-4xl font-bold text-white shadow-xl"
          >
            מתחילות! ▶️
          </button>
        </div>
      </div>
    );

  const step = steps[i];
  const title = `${header} ${i + 1}/${steps.length}`;
  if (step.type === 'learn')
    return (
      <div className="min-h-full pb-8">
        <TopBar title={title} emoji="👀" right={<Coins n={p.coins} />} />
        <LearnCards key={i} unit={step.unit} onDone={next} />
      </div>
    );
  return <GamePlay key={i} game={step.game} pool={step.pool} unitId={step.unitId} title={step.review ? `${title} · חזרה` : title} onContinue={next} />;
}
