import { useProfile } from '../lib/store';
import { useNav } from '../lib/nav';
import { getStage } from '../lib/curriculum';
import { unitBest, unitUnlocked } from '../lib/progress';
import { Coins, Stars, TopBar } from '../components/ui';
import { Instruction } from '../components/Speak';
import { sfx } from '../lib/sounds';
import { speakHe } from '../lib/speech';

export function StageScreen({ stageId }: { stageId: string }) {
  const { p } = useProfile();
  const { go } = useNav();
  const s = getStage(stageId);
  return (
    <div className="min-h-full pb-8">
      <TopBar title={s.title} emoji={s.emoji} right={<Coins n={p.coins} />} />
      <div className="mx-auto max-w-3xl px-3">
        <Instruction text="בחרי תחנה" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {s.units.map((u, i) => {
            const open = unitUnlocked(p, u);
            const best = unitBest(p, u);
            return (
              <button
                key={u.id}
                onClick={() => {
                  if (!open) {
                    sfx.oops();
                    speakHe('קודם צריך שני כוכבים בתחנה הקודמת');
                    return;
                  }
                  sfx.tap();
                  speakHe(u.title);
                  go({ name: 'unit', unitId: u.id });
                }}
                className={`tap card relative flex flex-col items-center gap-1 p-4 ${open ? '' : 'opacity-60 grayscale'}`}
              >
                <span className="absolute right-3 top-2 grid h-9 w-9 place-items-center rounded-full text-lg font-bold text-white" style={{ background: s.color }}>
                  {i + 1}
                </span>
                <span className="emoji text-6xl">{open ? u.emoji : '🔒'}</span>
                <span dir={/^[A-Z]/.test(u.title) ? 'ltr' : undefined} className="text-2xl font-bold text-violet-900">
                  {u.title}
                </span>
                <Stars n={best} size="text-2xl" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
