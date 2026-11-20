import { useProfile } from '../lib/store';
import { BADGES } from '../lib/rewards';
import { Coins, TopBar } from '../components/ui';
import { speakHe } from '../lib/speech';
import { streak } from '../lib/util';

export function BadgesScreen() {
  const { p } = useProfile();
  return (
    <div className="min-h-full pb-8">
      <TopBar title="התגים שלי" emoji="🏅" right={<Coins n={p.coins} />} />
      <div className="mx-auto max-w-3xl px-3">
        <p className="my-2 text-center text-2xl font-bold text-orange-600">🔥 {streak(p.days)} ימים ברצף</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BADGES.map((b) => {
            const has = p.badges.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => speakHe(b.title)}
                className={`tap card flex flex-col items-center gap-2 p-4 ${has ? '' : 'opacity-50'}`}
              >
                <span className={`emoji grid h-24 w-24 place-items-center rounded-full text-6xl ${has ? 'bg-amber-100 ring-4 ring-amber-300' : 'bg-slate-100 grayscale'}`}>
                  {has ? b.emoji : '❔'}
                </span>
                <span className="text-center text-xl font-bold text-violet-900">{b.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
