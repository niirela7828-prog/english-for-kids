import { useEffect, useState, type ReactNode } from 'react';
import { hasHebrewVoice, onVoicesChanged, speakEn, speakHe } from '../lib/speech';
import { useStore } from '../lib/store';

export function useHebrewVoice() {
  const [has, setHas] = useState(hasHebrewVoice());
  useEffect(() => onVoicesChanged(() => setHas(hasHebrewVoice())), []);
  const { profile } = useStore();
  return has && (profile?.settings.hebrewVoice ?? true);
}

/** Speaker button that reads Hebrew text. Hidden if the device has no Hebrew voice. */
export function SpeakHeButton({ text, className = '' }: { text: string; className?: string }) {
  const has = useHebrewVoice();
  if (!has) return null;
  return (
    <button
      aria-label="הקראה"
      onClick={(e) => {
        e.stopPropagation();
        speakHe(text);
      }}
      className={`tap grid h-16 w-16 shrink-0 place-items-center rounded-full bg-sky-100 text-3xl shadow ${className}`}
    >
      🔈
    </button>
  );
}

/** A Hebrew instruction line with a speaker. */
export function Instruction({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 px-2">
      <SpeakHeButton text={text} />
      <p className="text-2xl font-bold text-violet-900 sm:text-3xl">{children ?? text}</p>
    </div>
  );
}

/** Play (normal) + turtle (slow) buttons for an English text. */
export function PlayButtons({ text, big = false }: { text: string; big?: boolean }) {
  const size = big ? 'h-24 w-24 text-5xl' : 'h-16 w-16 text-3xl';
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <button aria-label="השמעה" onClick={() => speakEn(text)} className={`tap grid place-items-center rounded-full bg-violet-500 text-white shadow-lg ${size}`}>
        🔊
      </button>
      <button aria-label="השמעה איטית" onClick={() => speakEn(text, { slow: true })} className={`tap grid place-items-center rounded-full bg-emerald-400 shadow-lg ${size}`}>
        🐢
      </button>
    </div>
  );
}

/** English text (LTR) – tapping speaks it. Optional transliteration + translation. */
export function EnText({
  text,
  tr,
  he,
  className = 'text-5xl',
  speak = true,
}: {
  text: string;
  tr?: string;
  he?: string;
  className?: string;
  speak?: boolean;
}) {
  const { profile } = useStore();
  const showTr = profile?.settings.translit ?? true;
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        dir="ltr"
        lang="en"
        role={speak ? 'button' : undefined}
        onClick={speak ? () => speakEn(text) : undefined}
        className={`en font-bold text-slate-800 ${className}`}
      >
        {text}
      </span>
      {(tr && showTr) || he ? (
        <span className="text-xl text-slate-500">
          {tr && showTr && <span className="font-bold text-violet-600">{tr}</span>}
          {tr && showTr && he && ' · '}
          {he}
        </span>
      ) : null}
    </div>
  );
}
