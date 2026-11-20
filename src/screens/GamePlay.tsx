import { useCallback, useMemo, useRef, useState } from 'react';
import type { GameId, Item } from '../lib/types';
import { GAMES, buildable } from '../lib/curriculum';
import { useProfile } from '../lib/store';
import { pickTargets, updateStat } from '../lib/srs';
import { sfx } from '../lib/sounds';
import { speakHe, stopSpeech } from '../lib/speech';
import { confetti } from '../components/Confetti';
import { MascotSays, Mascot, type Mood } from '../components/Mascot';
import { Instruction } from '../components/Speak';
import { Coins, Modal, ProgressDots, Stars, TopBar } from '../components/ui';
import { accuracyToStars } from '../lib/progress';
import { newBadges, starsToCoins, type Badge } from '../lib/rewards';
import { ENCOURAGE, PRAISE, pick, todayKey } from '../lib/util';
import type { GameProps } from '../games/common';
import ListenChoose from '../games/ListenChoose';
import Balloons from '../games/Balloons';
import Match from '../games/Match';
import Memory from '../games/Memory';
import QA from '../games/QA';
import { BuildWord, SentenceOrder } from '../games/Sequence';

const COMPONENTS: Record<GameId, (p: GameProps) => JSX.Element> = {
  listen: ListenChoose,
  balloons: Balloons,
  match: Match,
  memory: Memory,
  build: BuildWord,
  order: SentenceOrder,
  qa: QA,
};

/** How many questions each game asks (5–8). */
function makeTargets(game: GameId, pool: Item[], level: number, p: Parameters<typeof pickTargets>[2]): Item[] {
  switch (game) {
    case 'memory':
      return pickTargets(pool, Math.min(level <= 1 ? 3 : level === 2 ? 4 : 6, pool.length), p);
    case 'match':
      return pickTargets(pool, Math.min(6, pool.length), p);
    case 'build':
      return pickTargets(pool.filter(buildable), 5, p);
    case 'order':
      return pickTargets(pool.filter((i) => i.en.split(' ').length >= 2), 5, p);
    case 'qa':
      return pickTargets(pool.filter((i) => i.q), 5, p);
    default:
      return pickTargets(pool, 6, p);
  }
}

export function GamePlay({
  game,
  pool,
  unitId,
  title,
  onContinue,
}: {
  game: GameId;
  pool: Item[];
  /** stars are saved for this unit (omit for mixed review rounds) */
  unitId?: string;
  title?: string;
  onContinue: (stars: number) => void;
}) {
  const { p, update } = useProfile();
  const [run, setRun] = useState(0);
  const meta = GAMES[game];
  return (
    <div className="min-h-full pb-28">
      <TopBar title={title ?? meta.title} emoji={meta.emoji} right={<Coins n={p.coins} />} />
      <Round
        key={run}
        game={game}
        pool={pool}
        unitId={unitId}
        onAgain={() => setRun((r) => r + 1)}
        onContinue={onContinue}
        update={update}
      />
    </div>
  );
}

function Round({
  game,
  pool,
  unitId,
  onAgain,
  onContinue,
  update,
}: {
  game: GameId;
  pool: Item[];
  unitId?: string;
  onAgain: () => void;
  onContinue: (stars: number) => void;
  update: ReturnType<typeof useProfile>['update'];
}) {
  const { p } = useProfile();
  const [level, setLevel] = useState(p.level);
  const targets = useMemo(() => makeTargets(game, pool, p.level, p), []); // eslint-disable-line react-hooks/exhaustive-deps
  const first = useRef(new Map<number, boolean>());
  const solved = useRef(new Set<number>());
  const streak = useRef({ right: 0, wrong: 0 });
  const [doneCount, setDoneCount] = useState(0);
  const [bubble, setBubble] = useState<{ text: string; mood: Mood } | null>(null);
  const bubbleTimer = useRef<number>();
  const [result, setResult] = useState<{ stars: number; coins: number; badges: Badge[] } | null>(null);

  const say = (text: string, mood: Mood) => {
    setBubble({ text, mood });
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 1800);
  };

  const report = useCallback(
    (q: number, correct: boolean) => {
      const isFirst = !first.current.has(q);
      if (isFirst) {
        first.current.set(q, correct);
        // adaptive difficulty
        const s = streak.current;
        if (correct) {
          s.right++;
          s.wrong = 0;
          if (s.right >= 5) {
            s.right = 0;
            setLevel((l) => Math.min(3, l + 1));
          }
        } else {
          s.wrong++;
          s.right = 0;
          if (s.wrong >= 2) {
            s.wrong = 0;
            setLevel((l) => Math.max(1, l - 1));
          }
        }
      }
      if (correct) {
        if (!solved.current.has(q)) {
          solved.current.add(q);
          setDoneCount(solved.current.size);
        }
        sfx.correct();
        confetti(false);
        say(pick(PRAISE), 'cheer');
      } else {
        sfx.oops();
        const msg = pick(ENCOURAGE);
        say(msg, 'think');
        speakHe(msg);
      }
    },
    [],
  );

  const onDone = useCallback(
    (accOverride?: number) => {
      const firsts = [...first.current.values()];
      const acc = accOverride ?? (firsts.length ? firsts.filter(Boolean).length / firsts.length : 1);
      const stars = accuracyToStars(acc);
      const coins = starsToCoins(stars);
      const apply = (prof: typeof p) => {
        const words = { ...prof.words };
        first.current.forEach((ok, q) => {
          const it = targets[q];
          if (it) words[it.id] = updateStat(words[it.id], ok);
        });
        const d = todayKey();
        return {
          ...prof,
          words,
          coins: prof.coins + coins,
          gamesPlayed: prof.gamesPlayed + 1,
          level,
          days: prof.days.includes(d) ? prof.days : [...prof.days, d],
          stars: unitId
            ? { ...prof.stars, [unitId]: { ...prof.stars[unitId], [game]: Math.max(stars, prof.stars[unitId]?.[game] ?? 0) } }
            : prof.stars,
        };
      };
      const earned = newBadges(apply(p));
      update((prof) => {
        const next = apply(prof);
        return { ...next, badges: [...new Set([...next.badges, ...earned.map((b) => b.id)])] };
      });
      setResult({ stars, coins, badges: earned });
      sfx.win();
      if (stars >= 2) confetti(true);
      speakHe(
        stars === 3
          ? 'כל הכבוד! קיבלת שלושה כוכבים!'
          : stars === 2
            ? 'יפה מאוד! קיבלת שני כוכבים!'
            : 'כל הכבוד שניסית! בפעם הבאה יהיה עוד יותר טוב!',
      );
    },
    [game, level, targets, unitId, update, p],
  );

  const Game = COMPONENTS[game];
  const kind = targets[0]?.kind ?? 'word';

  if (!targets.length) return <p className="p-8 text-center text-2xl">אין כאן מספיק תוכן למשחק הזה 🙈</p>;

  return (
    <div className="flex flex-col gap-4 px-3 pt-2">
      <Instruction text={GAMES[game].instruction(kind)} />
      <ProgressDots done={doneCount} total={targets.length} />
      <Game pool={pool} targets={targets} level={level} report={report} onDone={onDone} />

      <div className="pointer-events-none fixed bottom-2 right-2 z-20">
        <MascotSays text={bubble?.text} mood={bubble?.mood ?? 'happy'} size={80} />
      </div>

      {result && (
        <Modal>
          <Mascot mood="cheer" size={110} className="mx-auto animate-bob" />
          <div className="my-3 animate-pop">
            <Stars n={result.stars} size="text-6xl" />
          </div>
          <div className="mb-3 flex justify-center">
            <Coins n={result.coins} />
            <span className="sr-only">מטבעות</span>
          </div>
          {result.badges.map((b) => (
            <div key={b.id} className="mb-2 animate-pop rounded-2xl bg-amber-50 p-3 text-2xl font-bold text-amber-700">
              <span className="emoji text-4xl">{b.emoji}</span> תג חדש: {b.title}
            </div>
          ))}
          <div className="mt-4 flex justify-center gap-4">
            <button
              aria-label="שוב"
              onClick={() => {
                stopSpeech();
                onAgain();
              }}
              className="tap grid h-20 w-20 place-items-center rounded-full bg-sky-200 text-4xl shadow"
            >
              🔁
            </button>
            <button
              aria-label="המשך"
              onClick={() => {
                stopSpeech();
                onContinue(result.stars);
              }}
              className="tap grid h-20 w-32 place-items-center rounded-full bg-emerald-400 text-4xl shadow-lg"
            >
              ✔️
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
