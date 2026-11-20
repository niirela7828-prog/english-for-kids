import type { Profile } from './types';
import { STAGES } from './curriculum';
import { streak } from './util';
import { stageComplete } from './progress';

export const AVATARS = ['🦄', '🐱', '🐰', '🦊', '🐼', '🐸', '🦁', '🐨', '🐯', '🐧', '🦋', '🐬'];

export interface Sticker {
  id: string;
  emoji: string;
  price: number;
}

const S = (emoji: string, price: number, i: number): Sticker => ({ id: `s${i}`, emoji, price });
export const STICKERS: Sticker[] = [
  ...['⭐', '🌈', '🍓', '🌻', '🐞', '🎀', '🍭', '🧁', '🐣', '🍉'].map((e, i) => S(e, 10, i)),
  ...['🦄', '🦋', '🐬', '🦩', '🌟', '🎠', '🪐', '🍩', '🐙', '🦚'].map((e, i) => S(e, 20, i + 10)),
  ...['👑', '🏰', '🚀', '🧚‍♀️', '🐉', '💎', '🎡', '🧜‍♀️', '🦖', '🌋'].map((e, i) => S(e, 35, i + 20)),
];

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  test: (p: Profile) => boolean;
}

const maxStars = (p: Profile) => Math.max(0, ...Object.values(p.stars).flatMap((g) => Object.values(g)));
const knownCount = (p: Profile) => Object.values(p.words).filter((w) => w.c > 0).length;

export const BADGES: Badge[] = [
  { id: 'first-game', emoji: '🎮', title: 'המשחק הראשון!', test: (p) => p.gamesPlayed >= 1 },
  { id: 'three-stars', emoji: '⭐', title: 'שלושה כוכבים!', test: (p) => maxStars(p) >= 3 },
  { id: 'first-daily', emoji: '📅', title: 'שיעור יומי ראשון', test: (p) => Object.keys(p.daily).length >= 1 },
  { id: 'letters', emoji: '🔤', title: 'למדתי את כל האותיות!', test: (p) => stageComplete(p, STAGES[0]) },
  { id: 'words-30', emoji: '📚', title: 'יודעת 30 מילים', test: (p) => knownCount(p) >= 30 },
  { id: 'streak-3', emoji: '🔥', title: '3 ימים ברצף', test: (p) => streak(p.days) >= 3 },
  { id: 'streak-5', emoji: '🏆', title: '5 ימים ברצף', test: (p) => streak(p.days) >= 5 },
  { id: 'words-stage', emoji: '🧸', title: 'סיימתי את המילים הראשונות', test: (p) => stageComplete(p, STAGES[1]) },
  { id: 'games-25', emoji: '🎯', title: '25 משחקים', test: (p) => p.gamesPlayed >= 25 },
  { id: 'stickers-10', emoji: '🌟', title: 'אספנית מדבקות', test: (p) => p.stickers.length >= 10 },
  { id: 'sentences', emoji: '💬', title: 'מדברת במשפטים!', test: (p) => stageComplete(p, STAGES[2]) },
  { id: 'all', emoji: '👑', title: 'סיימתי את כל המפה!', test: (p) => STAGES.every((s) => stageComplete(p, s)) },
];

export const newBadges = (p: Profile) => BADGES.filter((b) => !p.badges.includes(b.id) && b.test(p));

export const starsToCoins = (stars: number) => stars * 5;
export const DAILY_BONUS = 15;
