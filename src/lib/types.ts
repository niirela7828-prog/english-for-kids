export type ItemKind = 'letter' | 'word' | 'sentence' | 'qa';

export interface Item {
  id: string;
  kind: ItemKind;
  /** English text (letter, word, sentence or answer) */
  en: string;
  /** Hebrew translation */
  he: string;
  /** Hebrew transliteration of the English */
  tr: string;
  emoji: string;
  /** letters only */
  lower?: string;
  sound?: string;
  example?: { en: string; he: string; tr: string; emoji: string };
  /** qa only: the question whose answer is `en` */
  q?: { en: string; he: string; tr: string };
}

export type GameId = 'listen' | 'match' | 'memory' | 'balloons' | 'build' | 'order' | 'qa';

export interface Unit {
  id: string;
  stageId: string;
  title: string;
  emoji: string;
  items: Item[];
  games: GameId[];
  story?: boolean;
}

export interface Stage {
  id: string;
  title: string;
  emoji: string;
  color: string;
  units: Unit[];
}

export interface WordStat {
  c: number; // correct (first try)
  w: number; // wrong (first try)
  box: number; // Leitner box 0..4
  due: number; // timestamp
}

export interface Settings {
  translit: boolean;
  sounds: boolean;
  hebrewVoice: boolean;
}

export interface Profile {
  name: string;
  avatar: string;
  createdAt: number;
  coins: number;
  stickers: string[];
  badges: string[];
  /** best stars per unit per game */
  stars: Record<string, Partial<Record<GameId, number>>>;
  learned: Record<string, boolean>;
  words: Record<string, WordStat>;
  level: number; // 1..3 adaptive difficulty
  days: string[]; // active dates YYYY-MM-DD
  daily: Record<string, boolean>; // daily lesson completed
  timeMs: number;
  timeByDay: Record<string, number>;
  gamesPlayed: number;
  settings: Settings;
}
