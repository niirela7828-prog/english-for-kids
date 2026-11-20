export type Mood = 'happy' | 'cheer' | 'think' | 'wave';

/** "פופו" – our original mascot: a fluffy cloud-bunny with a star on its tummy. */
export function Mascot({ mood = 'happy', size = 120, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const armsUp = mood === 'cheer';
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * (130 / 120)} className={className} aria-label="פופו">
      {/* ears */}
      <g className={mood === 'wave' ? 'origin-bottom' : ''}>
        <ellipse cx="38" cy="26" rx="11" ry="24" fill="#c4b5fd" transform="rotate(-12 38 26)" />
        <ellipse cx="38" cy="28" rx="5.5" ry="16" fill="#fbcfe8" transform="rotate(-12 38 28)" />
        <ellipse cx="82" cy="26" rx="11" ry="24" fill="#c4b5fd" transform="rotate(12 82 26)" />
        <ellipse cx="82" cy="28" rx="5.5" ry="16" fill="#fbcfe8" transform="rotate(12 82 28)" />
      </g>
      {/* arms */}
      {armsUp ? (
        <>
          <ellipse cx="16" cy="58" rx="9" ry="15" fill="#ddd6fe" transform="rotate(-30 16 58)" />
          <ellipse cx="104" cy="58" rx="9" ry="15" fill="#ddd6fe" transform="rotate(30 104 58)" />
        </>
      ) : (
        <>
          <ellipse cx="18" cy="88" rx="9" ry="14" fill="#ddd6fe" transform="rotate(25 18 88)" />
          <ellipse
            cx="102"
            cy={mood === 'wave' ? 62 : 88}
            rx="9"
            ry="14"
            fill="#ddd6fe"
            transform={mood === 'wave' ? 'rotate(40 102 62)' : 'rotate(-25 102 88)'}
          />
        </>
      )}
      {/* fluffy cloud body */}
      <g fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2">
        <circle cx="60" cy="80" r="40" />
        <circle cx="28" cy="96" r="16" />
        <circle cx="92" cy="96" r="16" />
        <circle cx="45" cy="112" r="14" />
        <circle cx="75" cy="112" r="14" />
      </g>
      <circle cx="60" cy="80" r="38" fill="#ede9fe" />
      <ellipse cx="60" cy="108" rx="34" ry="10" fill="#ede9fe" />
      {/* face */}
      <ellipse cx="45" cy="72" rx="7" ry={mood === 'cheer' ? 4 : 8} fill="#3b2f63" />
      <ellipse cx="75" cy="72" rx="7" ry={mood === 'cheer' ? 4 : 8} fill="#3b2f63" />
      {mood !== 'cheer' && (
        <>
          <circle cx="47.5" cy="69" r="2.5" fill="white" />
          <circle cx="77.5" cy="69" r="2.5" fill="white" />
        </>
      )}
      <ellipse cx="34" cy="86" rx="7" ry="4.5" fill="#f9a8d4" opacity=".8" />
      <ellipse cx="86" cy="86" rx="7" ry="4.5" fill="#f9a8d4" opacity=".8" />
      <path d="M57 80 q3 3 6 0" stroke="#3b2f63" strokeWidth="2" fill="none" strokeLinecap="round" />
      {mood === 'think' ? (
        <circle cx="60" cy="91" r="4" fill="#3b2f63" />
      ) : mood === 'cheer' ? (
        <path d="M48 87 q12 16 24 0 z" fill="#3b2f63" stroke="#3b2f63" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <path d="M50 88 q10 9 20 0" stroke="#3b2f63" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* star tummy */}
      <path
        d="M60 98 l3.5 7 7.5 1 -5.5 5 1.5 7.5 -7-3.8 -7 3.8 1.5-7.5 -5.5-5 7.5-1z"
        fill="#fde047"
        stroke="#facc15"
        strokeWidth="1"
      />
    </svg>
  );
}

/** Mascot with a speech bubble. */
export function MascotSays({ text, mood = 'happy', size = 90 }: { text?: string; mood?: Mood; size?: number }) {
  return (
    <div className="flex items-end gap-2">
      <Mascot mood={mood} size={size} className="shrink-0 animate-bob" />
      {text && (
        <div key={text} className="relative mb-6 animate-pop rounded-3xl bg-white px-4 py-3 text-xl font-bold text-violet-800 shadow-md">
          {text}
        </div>
      )}
    </div>
  );
}
