import { describe, expect, it } from 'vitest';
import { ALL_UNITS, STAGES, buildable } from '../lib/curriculum';

describe('content', () => {
  it('has 26 letters in groups of 4–5', () => {
    const letters = STAGES[0].units;
    expect(letters.flatMap((u) => u.items).length).toBe(26);
    letters.forEach((u) => expect(u.items.length).toBeGreaterThanOrEqual(4));
    letters.forEach((u) => expect(u.items.length).toBeLessThanOrEqual(5));
  });

  it('word topics have 8–10 words', () => {
    STAGES[1].units.forEach((u) => {
      expect(u.items.length, u.id).toBeGreaterThanOrEqual(8);
      expect(u.items.length, u.id).toBeLessThanOrEqual(10);
    });
  });

  it('every item is complete and ids are unique', () => {
    const ids = new Set<string>();
    for (const u of ALL_UNITS)
      for (const it of u.items) {
        expect(ids.has(it.id), it.id).toBe(false);
        ids.add(it.id);
        for (const k of ['en', 'he', 'tr', 'emoji'] as const) expect(it[k], `${it.id}.${k}`).toBeTruthy();
        if (it.kind === 'qa') expect(it.q?.en).toBeTruthy();
      }
  });

  it('pictures are distinct inside a unit (so "listen & choose" is fair)', () => {
    for (const u of ALL_UNITS) {
      const emojis = u.items.map((i) => (i.kind === 'letter' ? i.en : i.emoji));
      expect(new Set(emojis).size, u.id).toBe(emojis.length);
    }
  });

  it('every word unit has enough words for "build the word"', () => {
    STAGES[1].units.forEach((u) => expect(u.items.filter(buildable).length, u.id).toBeGreaterThanOrEqual(5));
  });
});
