import { describe, expect, it } from 'vitest';
import { newProfile } from '../lib/store';
import { pickTargets, updateStat, reviewItems } from '../lib/srs';
import { frontierUnit, stageUnlocked, unitUnlocked, accuracyToStars } from '../lib/progress';
import { STAGES } from '../lib/curriculum';
import { streak, todayKey } from '../lib/util';

describe('progression', () => {
  it('starts with only the first letters unit open', () => {
    const p = newProfile('x', '🐱');
    expect(unitUnlocked(p, STAGES[0].units[0])).toBe(true);
    expect(unitUnlocked(p, STAGES[0].units[1])).toBe(false);
    expect(stageUnlocked(p, STAGES[1])).toBe(false);
    expect(frontierUnit(p)?.id).toBe('letters-1');
  });

  it('2 stars opens the next unit, 1 star does not', () => {
    const p = newProfile('x', '🐱');
    p.stars['letters-1'] = { listen: 1 };
    expect(unitUnlocked(p, STAGES[0].units[1])).toBe(false);
    p.stars['letters-1'] = { listen: 1, match: 2 };
    expect(unitUnlocked(p, STAGES[0].units[1])).toBe(true);
  });

  it('next stage opens after the whole previous stage has 2+ stars', () => {
    const p = newProfile('x', '🐱');
    STAGES[0].units.forEach((u) => (p.stars[u.id] = { listen: 2 }));
    expect(stageUnlocked(p, STAGES[1])).toBe(true);
    expect(frontierUnit(p)?.id).toBe('words-colors');
  });

  it('maps accuracy to stars', () => {
    expect(accuracyToStars(1)).toBe(3);
    expect(accuracyToStars(0.8)).toBe(2);
    expect(accuracyToStars(0.3)).toBe(1);
  });
});

describe('spaced repetition', () => {
  it('mistakes reset the box and make the word due now', () => {
    const s = updateStat(updateStat(undefined, true), false, 1000);
    expect(s.box).toBe(0);
    expect(s.due).toBe(1000);
    expect(s.w).toBe(1);
  });

  it('prefers words with mistakes', () => {
    const p = newProfile('x', '🐱');
    const items = STAGES[1].units[2].items;
    items.forEach((i) => (p.words[i.id] = { c: 5, w: 0, box: 4, due: Date.now() + 1e9 }));
    p.words[items[3].id] = { c: 0, w: 5, box: 0, due: 0 };
    let hits = 0;
    for (let k = 0; k < 50; k++) if (pickTargets(items, 3, p).some((i) => i.id === items[3].id)) hits++;
    expect(hits).toBeGreaterThan(45);
    expect(reviewItems(p, items, 5).map((i) => i.id)).toEqual([items[3].id]);
  });

  it('repeats items without back-to-back duplicates when the pool is small', () => {
    const p = newProfile('x', '🐱');
    const t = pickTargets(STAGES[0].units[2].items, 6, p);
    expect(t.length).toBe(6);
    t.forEach((it, i) => i && expect(it.id).not.toBe(t[i - 1].id));
  });
});

describe('streak', () => {
  it('counts consecutive days', () => {
    const d = (n: number) => {
      const x = new Date();
      x.setDate(x.getDate() - n);
      return todayKey(x);
    };
    expect(streak([d(0), d(1), d(2)])).toBe(3);
    expect(streak([d(1), d(2)])).toBe(2);
    expect(streak([d(0), d(2)])).toBe(1);
  });
});
