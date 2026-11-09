import React, { useState } from 'react';
import { GameRoomState, Player } from '../../types/game.ts';
import { ReactionPad } from './ReactionPad.tsx';
import { Send, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  currentPlayer: Player;
  onSubmitAnswer: (promptId: string, text: string, thripItems?: [string, string, string]) => void;
  onSendReaction: (emoji: string) => void;
}

export const PlayerAnswering: React.FC<Props> = ({
  roomState,
  currentPlayer,
  onSubmitAnswer,
  onSendReaction,
}) => {
  // Find prompt assigned to this player
  const myBattle = roomState.battles.find(
    (b) => b.player1Id === currentPlayer.id || b.player2Id === currentPlayer.id
  );

  const [standardText, setStandardText] = useState('');
  const [thrip1, setThrip1] = useState('');
  const [thrip2, setThrip2] = useState('');
  const [thrip3, setThrip3] = useState('');

  if (!myBattle) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center text-slate-300">
        В этом раунде вы наблюдатель! Смотрите на экран ТВ и готовьтесь голосовать.
      </div>
    );
  }

  const isThrip = myBattle.prompt.type === 'THRIP';
  const hasSubmitted =
    (myBattle.player1Id === currentPlayer.id && !!myBattle.answer1) ||
    (myBattle.player2Id === currentPlayer.id && !!myBattle.answer2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isThrip) {
      if (!thrip1.trim() || !thrip2.trim() || !thrip3.trim()) return;
      const combined = `1. ${thrip1.trim()}  2. ${thrip2.trim()}  3. ${thrip3.trim()}`;
      onSubmitAnswer(myBattle.promptId, combined, [thrip1.trim(), thrip2.trim(), thrip3.trim()]);
    } else {
      if (!standardText.trim()) return;
      onSubmitAnswer(myBattle.promptId, standardText.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[90vh] justify-between text-slate-100">
      {/* Top Bar with Timer */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentPlayer.avatar}</span>
          <span className="text-xs font-bold text-white">{currentPlayer.name}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-indigo-500/30">
          <Clock className={`w-3.5 h-3.5 ${roomState.timer <= 10 ? 'text-rose-400 animate-pulse' : 'text-yellow-400'}`} />
          <span className="text-sm font-black font-mono text-white tabular-nums">
            {roomState.timer}с
          </span>
        </div>
      </div>

      {hasSubmitted ? (
        /* Submitted State */
        <div className="my-auto text-center space-y-4 bg-[#14172E] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">
              Ответ принят! 🔥
            </h2>
            <p className="text-xs text-slate-300">
              Вы отлично справились. Ждём остальных игроков перед началом баттлов.
            </p>
          </div>
        </div>
      ) : (
        /* Input Form State */
        <form onSubmit={handleSubmit} className="my-auto space-y-4">
          {/* Question Banner */}
          <div className="bg-[#14172E] border border-indigo-500/30 rounded-3xl p-5 shadow-xl text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400 block">
              {isThrip ? '🔥 Задание «3 вещи» (THRIP)' : 'Ваше задание'}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
              «{myBattle.prompt.text}»
            </h2>
          </div>

          {/* Form Inputs */}
          {isThrip ? (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-indigo-300 block mb-1">
                  1. Первый пункт:
                </label>
                <input
                  type="text"
                  maxLength={65}
                  value={thrip1}
                  onChange={(e) => setThrip1(e.target.value)}
                  placeholder="Первая вещь..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-indigo-300 block mb-1">
                  2. Второй пункт:
                </label>
                <input
                  type="text"
                  maxLength={65}
                  value={thrip2}
                  onChange={(e) => setThrip2(e.target.value)}
                  placeholder="Вторая вещь..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-indigo-300 block mb-1">
                  3. Третий пункт:
                </label>
                <input
                  type="text"
                  maxLength={65}
                  value={thrip3}
                  onChange={(e) => setThrip3(e.target.value)}
                  placeholder="Третья вещь..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <textarea
                rows={3}
                maxLength={120}
                value={standardText}
                onChange={(e) => setStandardText(e.target.value)}
                placeholder="Придумайте смешной или дерзкий ответ..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none shadow-inner"
                required
              />
              <span className="text-[10px] text-slate-500 block text-right mt-1 font-mono">
                {standardText.length}/120
              </span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-base uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Отправить ответ</span>
          </button>
        </form>
      )}

      {/* Bottom Reaction Pad */}
      <ReactionPad onSendReaction={onSendReaction} />
    </div>
  );
};
