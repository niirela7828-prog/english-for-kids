import type { Profile, Stage, Unit } from './types';
import { STAGES } from './curriculum';

export const PASS_STARS = 2;

export const unitBest = (p: Profile, u: Unit) => Math.max(0, ...Object.values(p.stars[u.id] ?? {}));
export const unitPassed = (p: Profile, u: Unit) => unitBest(p, u) >= PASS_STARS;
export const stageComplete = (p: Profile, s: Stage) => s.units.every((u) => unitPassed(p, u));

/** A stage opens only after every unit of the previous stage has 2+ stars. */
export const stageUnlocked = (p: Profile, s: Stage) => {
  const i = STAGES.indexOf(s);
  return i <= 0 || stageComplete(p, STAGES[i - 1]);
};

/** Inside a stage, units open one after another (2+ stars on the previous unit). */
export const unitUnlocked = (p: Profile, u: Unit) => {
  const s = STAGES.find((st) => st.id === u.stageId)!;
  if (!stageUnlocked(p, s)) return false;
  const i = s.units.indexOf(u);
  return i <= 0 || unitPassed(p, s.units[i - 1]);
};

/** The first open unit that isn't passed yet – where new material comes from. */
export function frontierUnit(p: Profile): Unit | null {
  for (const s of STAGES) for (const u of s.units) if (unitUnlocked(p, u) && !unitPassed(p, u)) return u;
  return null;
}

export const stageStars = (p: Profile, s: Stage) => s.units.reduce((n, u) => n + unitBest(p, u), 0);

export const accuracyToStars = (acc: number) => (acc >= 0.9 ? 3 : acc >= 0.65 ? 2 : 1);
