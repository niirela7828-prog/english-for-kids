import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { GameId } from './types';

export type Screen =
  | { name: 'map' }
  | { name: 'stage'; stageId: string }
  | { name: 'unit'; unitId: string }
  | { name: 'learn'; unitId: string }
  | { name: 'game'; unitId: string; game: GameId }
  | { name: 'daily' }
  | { name: 'album' }
  | { name: 'badges' }
  | { name: 'parents' };

interface Nav {
  screen: Screen;
  go: (s: Screen) => void;
  back: () => void;
  home: () => void;
}

const Ctx = createContext<Nav | null>(null);

/** Tiny stack navigator that also works with the Android/browser back button. */
export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: 'map' }]);
  const depth = useRef(1);
  depth.current = stack.length;

  useEffect(() => {
    history.replaceState({ depth: 1 }, '');
    // Every history entry stores its stack depth, so back / go(-n) / Android back all stay in sync.
    const onPop = () => {
      const target = (history.state?.depth as number | undefined) ?? 1;
      setStack((s) => s.slice(0, Math.max(1, Math.min(target, s.length))));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((s: Screen) => {
    depth.current += 1;
    history.pushState({ depth: depth.current }, '');
    setStack((st) => [...st, s]);
    window.scrollTo(0, 0);
  }, []);
  const back = useCallback(() => {
    if (depth.current > 1) history.back();
  }, []);
  const home = useCallback(() => {
    if (depth.current > 1) history.go(-(depth.current - 1));
  }, []);

  return <Ctx.Provider value={{ screen: stack[stack.length - 1], go, back, home }}>{children}</Ctx.Provider>;
}

export function useNav() {
  const n = useContext(Ctx);
  if (!n) throw new Error('NavProvider missing');
  return n;
}
