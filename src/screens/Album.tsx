import { useState } from 'react';
import { useProfile } from '../lib/store';
import { STICKERS, newBadges, type Sticker } from '../lib/rewards';
import { Coins, Modal, TopBar } from '../components/ui';
import { Instruction } from '../components/Speak';
import { sfx } from '../lib/sounds';
import { speakHe } from '../lib/speech';
import { confetti } from '../components/Confetti';

export function Album() {
  const { p, update } = useProfile();
  const [sel, setSel] = useState<Sticker | null>(null);
  const owned = new Set(p.stickers);

  const buy = (s: Sticker) => {
    const next = { ...p, coins: p.coins - s.price, stickers: [...p.stickers, s.id] };
    const earned = newBadges(next);
    update((prof) => ({
      ...prof,
      coins: prof.coins - s.price,
      stickers: [...prof.stickers, s.id],
      badges: [...new Set([...prof.badges, ...earned.map((b) => b.id)])],
    }));
    sfx.coin();
    confetti(false);
    speakHe('איזו מדבקה יפה!');
    setSel(null);
  };

  return (
    <div className="min-h-full pb-8">
      <TopBar title="אלבום מדבקות" emoji="📒" right={<Coins n={p.coins} />} />
      <div className="mx-auto max-w-3xl px-3">
        <Instruction text="קני מדבקות עם המטבעות שלך" />
        <p className="my-2 text-center text-2xl font-bold text-violet-700">
          {owned.size} / {STICKERS.length}
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {STICKERS.map((s) => {
            const has = owned.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => {
                  sfx.tap();
                  if (!has) setSel(s);
                  else confetti(false);
                }}
                className={`tap flex aspect-square flex-col items-center justify-center rounded-3xl shadow ${
                  has ? 'bg-white' : 'border-4 border-dashed border-violet-200 bg-violet-50'
                }`}
              >
                <span className={`emoji text-5xl ${has ? 'animate-pop' : 'opacity-20 grayscale'}`}>{s.emoji}</span>
                {!has && <span className="text-lg font-bold text-amber-600">🪙{s.price}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {sel && (
        <Modal onClose={() => setSel(null)}>
          <span className="emoji block text-8xl">{sel.emoji}</span>
          <p className="my-3 text-3xl font-bold text-amber-600">🪙 {sel.price}</p>
          {p.coins >= sel.price ? (
            <div className="flex justify-center gap-4">
              <button onClick={() => setSel(null)} className="tap h-20 w-20 rounded-full bg-slate-200 text-4xl">
                ✖️
              </button>
              <button onClick={() => buy(sel)} className="tap h-20 w-32 rounded-full bg-emerald-400 text-4xl shadow-lg">
                ✔️
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-2xl text-slate-600">צריך עוד {sel.price - p.coins} מטבעות. בואי נשחק ונרוויח! 🎮</p>
              <button onClick={() => setSel(null)} className="tap h-20 w-32 rounded-full bg-violet-300 text-4xl">
                👍
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
