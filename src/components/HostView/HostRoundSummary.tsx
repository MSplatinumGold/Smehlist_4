import React from 'react';
import { GameRoomState } from '../../types/game.ts';
import { Trophy, ArrowRight, Award } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  onNextRound: () => void;
}

export const HostRoundSummary: React.FC<Props> = ({ roomState, onNextRound }) => {
  // Sort players by score descending
  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col min-h-[85vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest font-black text-yellow-400">
          Итоги раунда {roomState.currentRound} из {roomState.totalRounds}
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Таблица лидеров вечеринки 🏆
        </h1>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="my-8 space-y-3">
        {sortedPlayers.map((player, idx) => {
          const isFirst = idx === 0;
          return (
            <div
              key={player.id}
              className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between transition-all ${
                isFirst
                  ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-indigo-950/40 border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-9 h-9 rounded-xl font-black flex items-center justify-center font-mono text-base ${
                    idx === 0
                      ? 'bg-yellow-400 text-slate-950 shadow-md'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-950'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>

                <span className="text-3xl">{player.avatar}</span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-white">
                      {player.name}
                    </span>
                    {isFirst && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Лидер
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {player.isBot ? '🤖 Виртуальный соперник' : '📱 Реальный игрок'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono tabular-nums block">
                  {player.score}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  очков
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Next Round Button */}
      <div className="pt-6 border-t border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-400">
          Следующий раунд принесёт ещё больше очков и неожиданных вопросов!
        </span>

        <button
          onClick={onNextRound}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] flex items-center justify-center gap-2"
        >
          <span>Старт Раунда {roomState.currentRound + 1}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
