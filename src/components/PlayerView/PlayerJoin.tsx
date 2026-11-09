import React, { useState, useEffect } from 'react';
import { LogIn, Tv } from 'lucide-react';

interface Props {
  initialCode?: string;
  onJoin: (code: string, name: string, avatar: string) => void;
  onSwitchToHost: () => void;
}

const AVATARS = ['😎', '🦄', '🐱', '🦊', '🦁', '🐼', '🤖', '👾', '🚀', '🥑', '🍕', '🔥'];

export const PlayerJoin: React.FC<Props> = ({ initialCode = '', onJoin, onSwitchToHost }) => {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😎');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    onJoin(code.trim().toUpperCase(), name.trim(), avatar);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col min-h-[90vh] justify-between text-slate-100">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <span className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
          <span className="text-yellow-400">MEH</span>LIST
        </span>
        <p className="text-xs text-slate-400">
          Контроллер игрока для вечеринки
        </p>
      </div>

      {/* Join Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#14172E] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-auto">
        {/* Room Code */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            4-значный код комнаты
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="КОД"
            className="w-full bg-slate-900 border-2 border-indigo-500/40 rounded-2xl px-4 py-3 text-center text-3xl font-black font-mono tracking-widest text-yellow-400 placeholder-slate-600 focus:outline-none focus:border-yellow-400 uppercase transition-colors"
            required
          />
        </div>

        {/* Player Name */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Ваше имя / никнейм
          </label>
          <input
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как вас зовут?"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            required
          />
        </div>

        {/* Avatar Picker */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Выберите аватар
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((av) => (
              <button
                type="button"
                key={av}
                onClick={() => setAvatar(av)}
                className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                  avatar === av
                    ? 'bg-yellow-400/20 border-2 border-yellow-400 scale-110 shadow-md'
                    : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Join */}
        <button
          type="submit"
          disabled={!code.trim() || !name.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-base uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          <span>Войти в игру</span>
        </button>
      </form>

      {/* Switch to TV Host mode button */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onSwitchToHost}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-xl bg-slate-900/60 border border-slate-800"
        >
          <Tv className="w-3.5 h-3.5 text-yellow-400" />
          <span>Хотите открыть главный экран для ТВ? Нажмите сюда</span>
        </button>
      </div>
    </div>
  );
};
