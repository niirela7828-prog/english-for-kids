import { useMemo, useState } from 'react';
import { useStore, useProfile } from '../lib/store';
import { ALL_UNITS, GAMES, ITEMS, STAGES } from '../lib/curriculum';
import { unitBest, stageUnlocked, unitUnlocked } from '../lib/progress';
import { hardItems } from '../lib/srs';
import { streak, todayKey } from '../lib/util';
import { englishVoiceName, hebrewVoiceName, speakEn, speakHe, speechSupported } from '../lib/speech';
import type { Settings } from '../lib/types';
import { Stars, TopBar } from '../components/ui';
import { sfx } from '../lib/sounds';

function Gate({ onOpen }: { onOpen: () => void }) {
  const [[a, b]] = useState(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)]);
  const [val, setVal] = useState('');
  const [bad, setBad] = useState(false);
  const press = (k: string) => {
    if (k === '⌫') return setVal((v) => v.slice(0, -1));
    const nv = (val + k).slice(0, 3);
    setVal(nv);
    if (Number(nv) === a * b) onOpen();
    else if (nv.length >= String(a * b).length) {
      setBad(true);
      setTimeout(() => {
        setBad(false);
        setVal('');
      }, 600);
    }
  };
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 pt-6">
      <p className="text-2xl font-bold text-slate-600">אזור הורים – פתרו כדי להיכנס</p>
      <p dir="ltr" className={`text-5xl font-bold text-violet-900 ${bad ? 'animate-wiggle text-rose-500' : ''}`}>
        {a} × {b} = {val || '?'}
      </p>
      <div dir="ltr" className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k ? (
            <button key={i} onClick={() => press(k)} className="tap h-20 w-20 rounded-2xl bg-white text-3xl font-bold shadow">
              {k}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}

const fmtMin = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} דק׳` : `${Math.floor(m / 60)} שע׳ ${m % 60} דק׳`;
};

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="tap flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow">
      <span className="text-xl font-bold">{label}</span>
      <span className={`flex h-10 w-20 items-center rounded-full p-1 transition-colors ${on ? 'justify-start bg-emerald-400' : 'justify-end bg-slate-300'}`}>
        <span className="h-8 w-8 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

function Dashboard() {
  const { p, update } = useProfile();
  const { reset } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const hard = useMemo(() => hardItems(p, [...ITEMS.values()]), [p]);
  const known = Object.values(p.words).filter((w) => w.c > 0).length;
  const setS = (k: keyof Settings, v: boolean) => update((x) => ({ ...x, settings: { ...x.settings, [k]: v } }));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = todayKey(d);
    return { k, label: d.toLocaleDateString('he-IL', { weekday: 'narrow' }), ms: p.timeByDay[k] ?? 0 };
  });
  const maxMs = Math.max(60000, ...last7.map((d) => d.ms));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 pb-10">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['⏱️', 'זמן למידה', fmtMin(p.timeMs)],
          ['📅', 'היום', fmtMin(p.timeByDay[todayKey()] ?? 0)],
          ['🔥', 'רצף ימים', String(streak(p.days))],
          ['🎮', 'משחקים', String(p.gamesPlayed)],
          ['📚', 'פריטים שנענו נכון', String(known)],
          ['📈', 'רמת קושי', `${p.level}/3`],
          ['🪙', 'מטבעות', String(p.coins)],
          ['🏅', 'תגים', String(p.badges.length)],
        ].map(([e, l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-3 text-center shadow">
            <div className="text-3xl">{e}</div>
            <div className="text-2xl font-bold text-violet-900">{v}</div>
            <div className="text-sm text-slate-500">{l}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-4 shadow">
        <h2 className="mb-2 text-2xl font-bold">זמן למידה – 7 ימים אחרונים</h2>
        <div className="flex h-32 items-end gap-2">
          {last7.map((d) => (
            <div key={d.k} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{Math.round(d.ms / 60000)}</span>
              <div className="w-full rounded-t-lg bg-violet-400" style={{ height: `${(d.ms / maxMs) * 90}px` }} />
              <span className="text-sm">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow">
        <h2 className="mb-2 text-2xl font-bold">התקדמות לפי נושא</h2>
        {STAGES.map((s) => (
          <div key={s.id} className="mb-3">
            <h3 className="text-xl font-bold" style={{ color: s.color }}>
              {s.emoji} {s.title} {stageUnlocked(p, s) ? '' : '🔒'}
            </h3>
            <div className="grid gap-1">
              {s.units.map((u) => {
                const items = u.items.map((i) => p.words[i.id]).filter(Boolean);
                const c = items.reduce((n, w) => n + w!.c, 0);
                const w = items.reduce((n, x) => n + x!.w, 0);
                return (
                  <div key={u.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1 text-lg">
                    <span className="emoji">{u.emoji}</span>
                    <span className="flex-1">{u.title}</span>
                    <span className="text-sm text-slate-500">
                      {c + w > 0 ? `${Math.round((c / (c + w)) * 100)}% דיוק` : unitUnlocked(p, u) ? 'טרם תורגל' : 'נעול'}
                    </span>
                    <Stars n={unitBest(p, u)} size="text-base" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-4 shadow">
        <h2 className="mb-2 text-2xl font-bold">מילים שקשות לה</h2>
        {hard.length === 0 ? (
          <p className="text-slate-500">עדיין אין מספיק נתונים 🙂</p>
        ) : (
          <div className="grid gap-1">
            {hard.map(({ item, stat }) => (
              <button key={item.id} onClick={() => speakEn(item.en)} className="flex items-center gap-3 rounded-xl bg-rose-50 px-3 py-2 text-right">
                <span className="emoji text-2xl">{item.emoji}</span>
                <span dir="ltr" className="en text-xl font-bold">{item.en}</span>
                <span className="flex-1 text-slate-500">{item.he}</span>
                <span className="text-sm">✅ {stat.c} · ❌ {stat.w}</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm text-slate-500">מילים אלה חוזרות אוטומטית בשיעור היום ובמשחקים.</p>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl bg-violet-50 p-4">
        <h2 className="text-2xl font-bold">הגדרות</h2>
        <Toggle label="תעתיק בעברית (קֶט)" on={p.settings.translit} onChange={(v) => setS('translit', v)} />
        <Toggle label="צלילים ואפקטים" on={p.settings.sounds} onChange={(v) => setS('sounds', v)} />
        <Toggle label="הקראת הוראות בעברית" on={p.settings.hebrewVoice} onChange={(v) => setS('hebrewVoice', v)} />
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-600">
          {speechSupported() ? (
            <>
              <div>
                קול אנגלית: <b dir="ltr">{englishVoiceName() ?? 'ברירת מחדל של המכשיר'}</b>{' '}
                <button className="mr-2 rounded-lg bg-violet-100 px-2 py-1" onClick={() => speakEn('Hello! I can speak English.')}>
                  🔊 בדיקה
                </button>
              </div>
              <div className="mt-1">
                קול עברית: <b>{hebrewVoiceName() ?? 'לא נמצא במכשיר (כפתורי ההקראה מוסתרים)'}</b>{' '}
                {hebrewVoiceName() && (
                  <button className="mr-2 rounded-lg bg-violet-100 px-2 py-1" onClick={() => speakHe('שלום! אני מדברת עברית')}>
                    🔊 בדיקה
                  </button>
                )}
              </div>
            </>
          ) : (
            'הדפדפן הזה לא תומך בהקראה. מומלץ Chrome או Safari.'
          )}
        </div>
        <p className="text-sm text-slate-500">
          משחקים זמינים: {Object.values(GAMES).map((g) => g.emoji + ' ' + g.title).join(' · ')}. סה״כ {ALL_UNITS.length} תחנות.
        </p>
      </section>

      <section className="rounded-3xl bg-rose-50 p-4">
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="tap w-full rounded-2xl bg-white px-4 py-3 text-xl font-bold text-rose-600 shadow">
            🗑️ איפוס כל ההתקדמות
          </button>
        ) : (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-xl font-bold text-rose-700">בטוחים? כל הכוכבים, המטבעות והמדבקות יימחקו.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="tap flex-1 rounded-2xl bg-white py-3 text-xl font-bold shadow">
                ביטול
              </button>
              <button
                onClick={() => {
                  sfx.tap();
                  reset();
                }}
                className="tap flex-1 rounded-2xl bg-rose-500 py-3 text-xl font-bold text-white shadow"
              >
                כן, לאפס
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function Parents() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-full">
      <TopBar title="אזור הורים" emoji="👨‍👩‍👧" />
      {open ? <Dashboard /> : <Gate onOpen={() => setOpen(true)} />}
    </div>
  );
}
