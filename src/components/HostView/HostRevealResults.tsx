import React from 'react';
import { GameRoomState } from '../../types/game.ts';
import { ArrowRight, Trophy, Zap } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  onNextBattle: () => void;
}

export const HostRevealResults: React.FC<Props> = ({ roomState, onNextBattle }) => {
  const battle = roomState.battles[roomState.currentBattleIndex];
  if (!battle) return null;

  const p1 = roomState.players.find((p) => p.id === battle.player1Id);
  const p2 = roomState.players.find((p) => p.id === battle.player2Id);

  // Count votes
  const votes1Players: string[] = [];
  const votes2Players: string[] = [];

  Object.entries(battle.votes).forEach(([voterId, targetId]) => {
    const voter = roomState.players.find((p) => p.id === voterId);
    if (!voter) return;
    if (targetId === battle.player1Id) votes1Players.push(voter.name);
    if (targetId === battle.player2Id) votes2Players.push(voter.name);
  });

  const count1 = votes1Players.length;
  const count2 = votes2Players.length;
  const total = count1 + count2;

  const percent1 = total > 0 ? Math.round((count1 / total) * 100) : 50;
  const percent2 = total > 0 ? Math.round((count2 / total) * 100) : 50;

  const isWinner1 = count1 > count2;
  const isWinner2 = count2 > count1;
  const isCleanSweep = (count1 > 0 && count2 === 0) || (count2 > 0 && count1 === 0);

  const isLastBattle = roomState.currentBattleIndex + 1 >= roomState.battles.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col min-h-[85vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black uppercase tracking-wider">
            Результаты голосования
          </span>
          <span className="text-xs text-slate-400">
            Баттл {roomState.currentBattleIndex + 1} из {roomState.battles.length}
          </span>
        </div>

        {isCleanSweep && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-xs font-black uppercase animate-bounce">
            <Zap className="w-3.5 h-3.5" />
            <span>СУПЕР-МЕХ: Чистая победа (+250)</span>
          </div>
        )}
      </div>

      {/* Prompt title */}
      <div className="text-center my-4 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-300">
          «{battle.prompt.text}»
        </h2>
      </div>

      {/* Results Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto items-stretch">
        {/* Card 1 */}
        <div
          className={`border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all relative ${
            isWinner1
              ? 'bg-gradient-to-b from-[#1E2548] to-[#141A38] border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.25)] scale-[1.02]'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          {isWinner1 && (
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow-md">
              <Trophy className="w-3 h-3 fill-current" /> Победитель
            </div>
          )}

          {/* Author Unmasked */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <span className="text-3xl">{p1?.avatar || '👤'}</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Автор ответа</span>
              <span className="text-base font-black text-white">{p1?.name}</span>
            </div>
          </div>

          {/* Answer text */}
          <div className="my-auto py-5">
            {battle.answer1?.thripItems ? (
              <ol className="space-y-2 text-left">
                {battle.answer1.thripItems.map((item, idx) => (
                  <li key={idx} className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400">#{idx + 1}</span> {item}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-2xl font-black text-white leading-snug">
                {battle.answer1?.text}
              </p>
            )}
          </div>

          {/* Votes & Points info */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-yellow-400 font-mono">
                {percent1}%
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +{battle.pointsAwarded?.player1 || 0} очков
              </span>
            </div>

            {/* Voter names tags */}
            <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
              {votes1Players.length > 0 ? (
                votes1Players.map((name, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-slate-600 italic">Голосов нет</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className={`border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all relative ${
            isWinner2
              ? 'bg-gradient-to-b from-[#1E2548] to-[#141A38] border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.25)] scale-[1.02]'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          {isWinner2 && (
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow-md">
              <Trophy className="w-3 h-3 fill-current" /> Победитель
            </div>
          )}

          {/* Author Unmasked */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <span className="text-3xl">{p2?.avatar || '👤'}</span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Автор ответа</span>
              <span className="text-base font-black text-white">{p2?.name}</span>
            </div>
          </div>

          {/* Answer text */}
          <div className="my-auto py-5">
            {battle.answer2?.thripItems ? (
              <ol className="space-y-2 text-left">
                {battle.answer2.thripItems.map((item, idx) => (
                  <li key={idx} className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-400">#{idx + 1}</span> {item}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-2xl font-black text-white leading-snug">
                {battle.answer2?.text}
              </p>
            )}
          </div>

          {/* Votes & Points info */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-yellow-400 font-mono">
                {percent2}%
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +{battle.pointsAwarded?.player2 || 0} очков
              </span>
            </div>

            {/* Voter names tags */}
            <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
              {votes2Players.length > 0 ? (
                votes2Players.map((name, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-slate-600 italic">Голосов нет</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-indigo-500/20">
        <span className="text-xs text-slate-400">
          Голоса подсчитаны. Нажмите кнопку ведущего для продолжения.
        </span>

        <button
          onClick={onNextBattle}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] flex items-center gap-2"
        >
          <span>{isLastBattle ? 'Перейти к итогам раунда' : 'Следующий баттл'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
