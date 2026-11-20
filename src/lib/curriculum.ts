import lettersData from '../data/letters.json';
import wordsData from '../data/words.json';
import sentencesData from '../data/sentences.json';
import convData from '../data/conversation.json';
import type { Item, Stage, Unit, GameId } from './types';

const letterById = new Map(lettersData.letters.map((l) => [l.letter, l]));

const lettersStage: Stage = {
  id: 'letters',
  title: 'אותיות',
  emoji: '🔤',
  color: '#f472b6',
  units: lettersData.groups.map((group, i) => ({
    id: `letters-${i + 1}`,
    stageId: 'letters',
    title: `${group[0]}–${group[group.length - 1]}`,
    emoji: letterById.get(group[0])!.emoji,
    games: ['listen', 'balloons', 'match', 'memory'] as GameId[],
    items: group.map((L): Item => {
      const l = letterById.get(L)!;
      return {
        id: `L-${L}`,
        kind: 'letter',
        en: L,
        lower: L.toLowerCase(),
        he: `${l.word} · ${l.wordHe}`,
        tr: l.name,
        sound: l.sound,
        emoji: l.emoji,
        example: { en: l.word, he: l.wordHe, tr: l.wordTr, emoji: l.emoji },
      };
    }),
  })),
};

const wordsStage: Stage = {
  id: 'words',
  title: 'מילים ראשונות',
  emoji: '🧸',
  color: '#60a5fa',
  units: wordsData.topics.map((t) => ({
    id: `words-${t.id}`,
    stageId: 'words',
    title: t.title,
    emoji: t.emoji,
    games: ['listen', 'match', 'memory', 'balloons', 'build'] as GameId[],
    items: t.words.map((w): Item => ({ id: `W-${t.id}-${w.en}`, kind: 'word', ...w })),
  })),
};

const sentencesStage: Stage = {
  id: 'sentences',
  title: 'משפטים קצרים',
  emoji: '💬',
  color: '#34d399',
  units: sentencesData.units.map((u) => ({
    id: `sent-${u.id}`,
    stageId: 'sentences',
    title: u.title,
    emoji: u.emoji,
    games: ['listen', 'order', 'match'] as GameId[],
    items: u.sentences.map((s, i): Item => ({ id: `S-${u.id}-${i}`, kind: 'sentence', ...s })),
  })),
};

const convStage: Stage = {
  id: 'conversation',
  title: 'שיחה וסיפורים',
  emoji: '📖',
  color: '#fbbf24',
  units: [
    ...convData.qa.map((u) => ({
      id: `qa-${u.id}`,
      stageId: 'conversation',
      title: u.title,
      emoji: u.emoji,
      games: ['qa', 'listen', 'order'] as GameId[],
      items: u.items.map((s, i): Item => ({ id: `Q-${u.id}-${i}`, kind: 'qa', ...s })),
    })),
    ...convData.stories.map((u) => ({
      id: `story-${u.id}`,
      stageId: 'conversation',
      title: u.title,
      emoji: u.emoji,
      story: true,
      games: ['listen', 'order'] as GameId[],
      items: u.sentences.map((s, i): Item => ({ id: `T-${u.id}-${i}`, kind: 'sentence', ...s })),
    })),
  ],
};

export const STAGES: Stage[] = [lettersStage, wordsStage, sentencesStage, convStage];
export const ALL_UNITS: Unit[] = STAGES.flatMap((s) => s.units);
export const ITEMS: Map<string, Item> = new Map(ALL_UNITS.flatMap((u) => u.items.map((i) => [i.id, i] as const)));
export const UNIT_OF_ITEM: Map<string, Unit> = new Map(ALL_UNITS.flatMap((u) => u.items.map((i) => [i.id, u] as const)));

export const getStage = (id: string) => STAGES.find((s) => s.id === id)!;
export const getUnit = (id: string) => ALL_UNITS.find((u) => u.id === id)!;

export interface GameMeta {
  id: GameId;
  title: string;
  emoji: string;
  instruction: (kind: Item['kind']) => string;
}

export const GAMES: Record<GameId, GameMeta> = {
  listen: {
    id: 'listen',
    title: 'שמעי ובחרי',
    emoji: '👂',
    instruction: (k) => (k === 'letter' ? 'הקשיבי ובחרי את האות הנכונה' : 'הקשיבי ובחרי את התמונה הנכונה'),
  },
  match: {
    id: 'match',
    title: 'התאמה',
    emoji: '🔗',
    instruction: (k) => (k === 'letter' ? 'הקישי על אות ואז על התמונה שמתחילה בה' : 'הקישי על מילה ואז על התמונה שלה'),
  },
  memory: { id: 'memory', title: 'זיכרון', emoji: '🃏', instruction: () => 'הפכי שני קלפים ומצאי זוג' },
  balloons: { id: 'balloons', title: 'בלונים', emoji: '🎈', instruction: () => 'הקשיבי ופוצצי את הבלון הנכון' },
  build: { id: 'build', title: 'בני את המילה', emoji: '🧩', instruction: () => 'הקישי על האותיות לפי הסדר' },
  order: { id: 'order', title: 'סדרי את המשפט', emoji: '🚂', instruction: () => 'הקישי על המילים לפי הסדר' },
  qa: { id: 'qa', title: 'עני על השאלה', emoji: '💬', instruction: () => 'הקשיבי לשאלה ובחרי את התשובה' },
};

/** Words usable in "build the word": letters only, short. */
export const buildable = (it: Item) => it.kind === 'word' && /^[a-z]{2,6}$/.test(it.en);
