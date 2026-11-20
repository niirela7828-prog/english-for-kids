import { useEffect, useState } from 'react';

type Burst = { id: number; pieces: { x: number; dx: number; delay: number; color: string; rot: number; shape: string }[] };
const COLORS = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];
let emit: ((big: boolean) => void) | null = null;

/** Fire confetti from anywhere. */
export const confetti = (big = false) => emit?.(big);

export function ConfettiLayer() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  useEffect(() => {
    let n = 0;
    emit = (big) => {
      const count = big ? 90 : 30;
      const b: Burst = {
        id: ++n,
        pieces: Array.from({ length: count }, () => ({
          x: big ? Math.random() * 100 : 35 + Math.random() * 30,
          dx: (Math.random() - 0.5) * 40,
          delay: Math.random() * (big ? 0.6 : 0.15),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rot: Math.random() * 720 - 360,
          shape: Math.random() < 0.3 ? '50%' : '3px',
        })),
      };
      setBursts((bs) => [...bs, b]);
      setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== b.id)), 2600);
    };
    return () => {
      emit = null;
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bursts.flatMap((b) =>
        b.pieces.map((p, i) => (
          <span
            key={`${b.id}-${i}`}
            className="confetti-piece"
            style={
              {
                left: `${p.x}%`,
                background: p.color,
                borderRadius: p.shape,
                animationDelay: `${p.delay}s`,
                '--dx': `${p.dx}vw`,
                '--rot': `${p.rot}deg`,
              } as React.CSSProperties
            }
          />
        )),
      )}
    </div>
  );
}
