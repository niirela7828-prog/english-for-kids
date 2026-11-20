import { useProfile } from '../lib/store';
import { useNav } from '../lib/nav';
import { STAGES } from '../lib/curriculum';
import { stageStars, stageUnlocked, stageComplete } from '../lib/progress';
import { Coins } from '../components/ui';
import { MascotSays } from '../components/Mascot';
import { SpeakHeButton } from '../components/Speak';
import { sfx } from '../lib/sounds';
import { speakHe } from '../lib/speech';
import { streak, todayKey } from '../lib/util';

// positions of the 4 stations along the winding path (percent of the map box)
const SPOTS = [
  { x: 22, y: 84 },
  { x: 74, y: 64 },
  { x: 28, y: 40 },
  { x: 72, y: 15 },
];

export function MapScreen() {
  const { p } = useProfile();
  const { go } = useNav();
  const st = streak(p.days);
  const dailyDone = !!p.daily[todayKey()];

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-3 px-3 pb-6 pt-3">
      {/* top bar */}
      <div className="flex items-center gap-2">
        <span className="emoji grid h-16 w-16 place-items-center rounded-full bg-white text-5xl shadow">{p.avatar}</span>
        <span className="text-3xl font-bold text-violet-900">{p.name}</span>
        <span className="flex-1" />
        {st > 0 && <span className="rounded-full bg-orange-100 px-3 py-1 text-2xl font-bold text-orange-600 shadow-sm">🔥 {st}</span>}
        <Coins n={p.coins} />
      </div>

      {/* daily lesson */}
      <button
        onClick={() => {
          sfx.tap();
          go({ name: 'daily' });
        }}
        className="tap flex items-center gap-3 rounded-[2rem] bg-gradient-to-l from-amber-300 to-pink-300 p-3 shadow-lg"
      >
        <MascotSays mood={dailyDone ? 'cheer' : 'wave'} size={70} />
        <span className="flex-1 text-right text-3xl font-bold text-violet-900">
          שיעור היום {dailyDone ? '✅' : '☀️'}
        </span>
        <span className="text-5xl">▶️</span>
      </button>

      {/* adventure map */}
      <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-sky-200 via-emerald-100 to-lime-200 shadow-inner" style={{ aspectRatio: '3 / 4', maxHeight: '70vh', marginInline: 'auto' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path
            d="M22 92 C 22 75, 74 80, 74 64 S 28 55, 28 40 S 72 30, 72 12"
            stroke="#fde68a"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M22 92 C 22 75, 74 80, 74 64 S 28 55, 28 40 S 72 30, 72 12"
            stroke="#f59e0b"
            strokeWidth="0.8"
            strokeDasharray="2 3"
            fill="none"
          />
        </svg>
        {/* decorations */}
        <span className="emoji absolute left-[6%] top-[55%] text-4xl">🌳</span>
        <span className="emoji absolute right-[8%] top-[42%] text-4xl">🌷</span>
        <span className="emoji absolute left-[45%] top-[4%] text-4xl">🏰</span>
        <span className="emoji absolute right-[5%] top-[85%] text-4xl">🍄</span>
        <span className="emoji absolute left-[48%] top-[25%] text-3xl">☁️</span>
        <span className="emoji absolute left-[8%] top-[12%] text-3xl">🌈</span>

        {STAGES.map((s, i) => {
          const open = stageUnlocked(p, s);
          const done = stageComplete(p, s);
          const stars = stageStars(p, s);
          return (
            <button
              key={s.id}
              onClick={() => {
                if (!open) {
                  sfx.oops();
                  speakHe('השלב הזה עוד נעול. צריך שני כוכבים בכל התחנות של השלב הקודם');
                  return;
                }
                sfx.tap();
                speakHe(s.title);
                go({ name: 'stage', stageId: s.id });
              }}
              className="tap absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%` }}
            >
              <span
                className={`emoji grid h-24 w-24 place-items-center rounded-full border-8 border-white text-5xl shadow-xl sm:h-28 sm:w-28 ${
                  open ? '' : 'grayscale'
                } ${open && !done ? 'animate-bob' : ''}`}
                style={{ background: open ? s.color : '#cbd5e1' }}
              >
                {open ? s.emoji : '🔒'}
              </span>
              <span className="mt-1 rounded-full bg-white/90 px-3 py-0.5 text-lg font-bold text-violet-900 shadow">
                {s.title}
              </span>
              {open && (
                <span className="text-lg font-bold text-amber-600">
                  ⭐ {stars}/{s.units.length * 3}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* bottom actions */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => go({ name: 'album' })} className="tap flex h-20 items-center justify-center gap-2 rounded-3xl bg-white text-2xl font-bold text-violet-900 shadow">
          <span className="emoji text-4xl">📒</span> מדבקות
        </button>
        <button onClick={() => go({ name: 'badges' })} className="tap flex h-20 items-center justify-center gap-2 rounded-3xl bg-white text-2xl font-bold text-violet-900 shadow">
          <span className="emoji text-4xl">🏅</span> תגים
        </button>
        <button onClick={() => go({ name: 'parents' })} className="tap flex h-20 items-center justify-center gap-2 rounded-3xl bg-white text-xl font-bold text-slate-500 shadow">
          <span className="emoji text-3xl">🔒</span> הורים
        </button>
      </div>
      <div className="flex justify-center">
        <SpeakHeButton text={`שלום ${p.name}! בחרי תחנה במפה, או התחילי את שיעור היום`} />
      </div>
    </div>
  );
}
