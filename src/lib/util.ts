export const shuffle = <T,>(arr: readonly T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const sample = <T,>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, n);

export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const DAY = 24 * 60 * 60 * 1000;

/** Consecutive active days ending today (or yesterday, so the streak isn't lost before playing today). */
export function streak(days: string[], now = new Date()): number {
  const set = new Set(days);
  const d = new Date(now);
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const PRAISE = ['כל הכבוד!', 'מצוין!', 'יופי!', 'וואו, נכון!', 'את אלופה!', 'נהדר!'];
export const ENCOURAGE = ['כמעט! בואי ננסה שוב', 'לא נורא, נסי שוב', 'עוד ניסיון קטן!'];
