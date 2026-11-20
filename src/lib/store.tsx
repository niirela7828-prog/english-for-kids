import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Profile, Settings } from './types';
import { todayKey } from './util';
import { setSoundsEnabled } from './sounds';
import { setHebrewEnabled } from './speech';

const KEY = 'efk-profile-v1';

export const defaultSettings: Settings = { translit: true, sounds: true, hebrewVoice: true };

export function newProfile(name: string, avatar: string): Profile {
  return {
    name,
    avatar,
    createdAt: Date.now(),
    coins: 0,
    stickers: [],
    badges: [],
    stars: {},
    learned: {},
    words: {},
    level: 1,
    days: [],
    daily: {},
    timeMs: 0,
    timeByDay: {},
    gamesPlayed: 0,
    settings: { ...defaultSettings },
  };
}

function load(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    // fill fields added in later versions
    return { ...newProfile(p.name, p.avatar), ...p, settings: { ...defaultSettings, ...p.settings } };
  } catch {
    return null;
  }
}

interface Store {
  profile: Profile | null;
  update: (fn: (p: Profile) => Profile) => void;
  create: (name: string, avatar: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(load);
  const ref = useRef(profile);
  ref.current = profile;

  useEffect(() => {
    if (profile) localStorage.setItem(KEY, JSON.stringify(profile));
    setSoundsEnabled(profile?.settings.sounds ?? true);
    setHebrewEnabled(profile?.settings.hebrewVoice ?? true);
  }, [profile]);

  const update = useCallback((fn: (p: Profile) => Profile) => {
    setProfile((p) => (p ? fn(p) : p));
  }, []);

  // Track study time while the app is visible
  useEffect(() => {
    const STEP = 15000;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible' || !ref.current) return;
      const d = todayKey();
      update((p) => ({
        ...p,
        timeMs: p.timeMs + STEP,
        timeByDay: { ...p.timeByDay, [d]: (p.timeByDay[d] ?? 0) + STEP },
        days: p.days.includes(d) ? p.days : [...p.days, d],
      }));
    }, STEP);
    return () => clearInterval(id);
  }, [update]);

  const create = useCallback((name: string, avatar: string) => {
    const p = newProfile(name, avatar);
    p.days = [todayKey()];
    setProfile(p);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setProfile(null);
  }, []);

  return <Ctx.Provider value={{ profile, update, create, reset }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
}

/** For screens shown only when a profile exists */
export function useProfile() {
  const { profile, update } = useStore();
  return { p: profile!, update };
}
