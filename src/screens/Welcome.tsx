import { useState } from 'react';
import { useStore } from '../lib/store';
import { AVATARS } from '../lib/rewards';
import { MascotSays } from '../components/Mascot';
import { Instruction } from '../components/Speak';
import { sfx } from '../lib/sounds';
import { speakHe } from '../lib/speech';

export function Welcome() {
  const { create } = useStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const ready = name.trim().length > 0 && avatar;

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center gap-6 px-4 py-8">
      <MascotSays text="שלום! אני פופו 💜" mood="wave" size={130} />
      <h1 className="text-center text-4xl font-bold text-violet-900">בואי נלמד אנגלית יחד!</h1>

      <Instruction text="איך קוראים לך?" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={14}
        placeholder="השם שלי"
        className="h-20 w-full max-w-sm rounded-3xl border-4 border-violet-200 bg-white px-6 text-center text-4xl font-bold text-violet-900 outline-none focus:border-violet-400"
      />

      <Instruction text="בחרי דמות" />
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {AVATARS.map((a) => (
          <button
            key={a}
            onClick={() => {
              sfx.tap();
              setAvatar(a);
            }}
            className={`tap emoji grid h-20 w-20 place-items-center rounded-3xl bg-white text-5xl shadow ${
              avatar === a ? 'scale-110 ring-8 ring-pink-400' : ''
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <button
        disabled={!ready}
        onClick={() => {
          sfx.win();
          speakHe(`שלום ${name.trim()}! יוצאים להרפתקה!`);
          create(name.trim(), avatar!);
        }}
        className="tap h-24 w-full max-w-sm rounded-full bg-gradient-to-l from-pink-400 to-violet-500 text-4xl font-bold text-white shadow-xl disabled:opacity-40"
      >
        יוצאים לדרך! 🚀
      </button>
    </div>
  );
}
