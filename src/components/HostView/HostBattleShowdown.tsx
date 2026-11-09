import React from 'react';
import { GameRoomState } from '../../types/game.ts';
import { Clock, Smartphone } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
}

export const HostBattleShowdown: React.FC<Props> = ({ roomState }) => {
  const battle = roomState.battles[roomState.currentBattleIndex];
  if (!battle) return null;

  const votesCount = Object.keys(battle.votes).length;
  // Non-competing voters count
  const eligibleVoters = roomState.players.filter(
    (p) => p.id !== battle.player1Id && p.id !== battle.player2Id
  );
  const totalVoters = eligibleVoters.length > 0 ? eligibleVoters.length : roomState.players.length;

  const isThrip = battle.prompt.type === 'THRIP';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col min-h-[85vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black uppercase tracking-wider">
            Баттл {roomState.currentBattleIndex + 1} из {roomState.battles.length}
          </span>
          <span className="text-xs text-slate-400">
            {battle.prompt.tag === '18+' ? '🔞 18+' : battle.prompt.tag === 'FAMILY' ? '🌱 Семейный' : '⚡ STANDARD'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Голосуйте на телефонах:</span>
            <span className="font-mono text-white font-bold">{votesCount}/{totalVoters}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/30">
            <Clock className={`w-4 h-4 ${roomState.timer <= 5 ? 'text-rose-400 animate-pulse' : 'text-yellow-400'}`} />
            <span className="text-xl font-black font-mono tabular-nums text-white">
              {roomState.timer}
            </span>
          </div>
        </div>
      </div>

      {/* Big Central Prompt */}
      <div className="text-center my-6 max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 block mb-2">
          {isThrip ? '🔥 Задание формата «Тройка» (THRIP)' : 'Вопрос раунда'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          «{battle.prompt.text}»
        </h1>
      </div>

      {/* Head-to-Head Answers Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto items-stretch">
        {/* Option A (Left) */}
        <div className="bg-gradient-to-b from-[#181B38] to-[#121429] border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative group hover:border-yellow-400/50 transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="px-3 py-1 rounded-xl bg-indigo-600/40 text-indigo-300 text-xs font-black uppercase tracking-wider">
              Вариант 1
            </span>
            <span className="text-xs text-slate-500 font-mono">Анонимный ответ</span>
          </div>

          <div className="my-auto py-4">
            {battle.answer1?.thripItems ? (
              <ol className="space-y-3 text-left">
                {battle.answer1.thripItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-black flex items-center justify-center shrink-0 text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-white pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-white text-center leading-snug">
                {battle.answer1?.text || '«Ответ не предоставлен»'}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Кнопка [1] на контроллере
            </span>
          </div>
        </div>

        {/* Option B (Right) */}
        <div className="bg-gradient-to-b from-[#181B38] to-[#121429] border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative group hover:border-yellow-400/50 transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="px-3 py-1 rounded-xl bg-purple-600/40 text-purple-300 text-xs font-black uppercase tracking-wider">
              Вариант 2
            </span>
            <span className="text-xs text-slate-500 font-mono">Анонимный ответ</span>
          </div>

          <div className="my-auto py-4">
            {battle.answer2?.thripItems ? (
              <ol className="space-y-3 text-left">
                {battle.answer2.thripItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-black flex items-center justify-center shrink-0 text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-white pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-white text-center leading-snug">
                {battle.answer2?.text || '«Ответ не предоставлен»'}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Кнопка [2] на контроллере
            </span>
          </div>
        </div>
      </div>

      {/* Bottom hint banner */}
      <div className="text-center py-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 mt-4">
        Авторы не видят свои кнопки. Все остальные игроки голосуют за самый смешной вариант!
      </div>
    </div>
  );
};
