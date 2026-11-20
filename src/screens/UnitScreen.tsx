import { useProfile } from '../lib/store';
import { useNav } from '../lib/nav';
import { GAMES, getUnit } from '../lib/curriculum';
import { Coins, Stars, TopBar } from '../components/ui';
import { Instruction, SpeakHeButton } from '../components/Speak';
import { sfx } from '../lib/sounds';
import { PASS_STARS, unitBest } from '../lib/progress';

export function UnitScreen({ unitId }: { unitId: string }) {
  const { p } = useProfile();
  const { go } = useNav();
  const u = getUnit(unitId);
  const learned = p.learned[u.id];
  return (
    <div className="min-h-full pb-8">
      <TopBar title={u.title} emoji={u.emoji} right={<Coins n={p.coins} />} />
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3">
        <Instruction text={learned ? 'בחרי משחק' : 'קודם נלמד, ואחר כך נשחק'} />
        <button
          onClick={() => {
            sfx.tap();
            go({ name: 'learn', unitId });
          }}
          className={`tap flex items-center justify-center gap-4 rounded-[2rem] bg-gradient-to-l from-sky-300 to-violet-300 p-5 text-4xl font-bold text-violet-950 shadow-lg ${
            learned ? '' : 'animate-glow'
          }`}
        >
          <span className="emoji text-6xl">{u.story ? '📖' : '👀'}</span> {u.story ? 'קוראים סיפור' : 'לומדים'}
          {learned && <span>✅</span>}
        </button>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {u.games.map((g) => {
            const meta = GAMES[g];
            const stars = p.stars[u.id]?.[g] ?? 0;
            return (
              <div key={g} className="relative">
                <button
                  onClick={() => {
                    sfx.tap();
                    go({ name: 'game', unitId, game: g });
                  }}
                  className="tap card flex w-full flex-col items-center gap-1 p-4"
                >
                  <span className="emoji text-6xl">{meta.emoji}</span>
                  <span className="text-2xl font-bold text-violet-900">{meta.title}</span>
                  <Stars n={stars} size="text-2xl" />
                </button>
                <SpeakHeButton text={meta.title} className="absolute -left-2 -top-2 !h-12 !w-12 !text-2xl" />
              </div>
            );
          })}
        </div>
        {unitBest(p, u) < PASS_STARS && (
          <p className="text-center text-xl text-slate-500">⭐⭐ = התחנה הבאה נפתחת</p>
        )}
      </div>
    </div>
  );
}
