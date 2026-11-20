import type { ReactNode } from 'react';
import { useNav } from '../lib/nav';
import { sfx } from '../lib/sounds';

export function TopBar({ title, emoji, right }: { title?: string; emoji?: string; right?: ReactNode }) {
  const { back, home } = useNav();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-cream/90 px-3 py-2 backdrop-blur">
      <button aria-label="חזרה" onClick={() => { sfx.tap(); back(); }} className="tap grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow">
        ➡️
      </button>
      <button aria-label="מפה" onClick={() => { sfx.tap(); home(); }} className="tap grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow">
        🗺️
      </button>
      <h1 className="flex-1 truncate text-center text-3xl font-bold text-violet-900">
        {emoji} {title}
      </h1>
      <div className="flex min-w-[8.5rem] justify-end">{right}</div>
    </header>
  );
}

export function Stars({ n, size = 'text-3xl', max = 3 }: { n: number; size?: string; max?: number }) {
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${n} כוכבים`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  );
}

export function Coins({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-2xl font-bold text-amber-700 shadow-sm">
      🪙 {n}
    </span>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md animate-pop rounded-[2rem] bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ProgressDots({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 py-2" dir="ltr">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-4 w-4 rounded-full transition-colors ${i < done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
      ))}
    </div>
  );
}
