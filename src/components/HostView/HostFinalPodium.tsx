import React from 'react';
import { GameRoomState } from '../../types/game.ts';
import { Trophy, RotateCcw, Crown, Sparkles } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  onRestartGame: () => void;
}

export const HostFinalPodium: React.FC<Props> = ({ roomState, onRestartGame }) => {
  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);

  const champion = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col min-h-[85vh] justify-between text-slate-100 text-center">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-black uppercase tracking-widest border border-yellow-400/40 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> ФИНАЛ ИГРЫ
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Церемония Награждения 👑
        </h1>
        <p className="text-sm text-slate-400">
          Победитель получает звание главного стендап-комика вечеринки!
        </p>
      </div>

      {/* Podium Visualization */}
      <div className="my-8 flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto w-full pt-12">
        {/* 2nd Place */}
        {second && (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-4xl mb-2">{second.avatar}</span>
            <span className="text-xs font-bold text-white truncate max-w-[100px] mb-1">
              {second.name}
            </span>
            <span className="text-xs font-black text-slate-400 font-mono mb-2">
              {second.score} очков
            </span>
            <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl h-36 sm:h-44 flex flex-col items-center justify-start pt-3 border-t-2 border-slate-400/60 shadow-lg">
              <span className="text-2xl font-black font-mono text-slate-300">2</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Серебро</span>
            </div>
          </div>
        )}

        {/* 1st Place Champion */}
        {champion && (
          <div className="flex-1 flex flex-col items-center relative -top-6">
            <Crown className="w-8 h-8 text-yellow-400 animate-bounce mb-1" />
            <span className="text-6xl mb-2 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
              {champion.avatar}
            </span>
            <span className="text-sm sm:text-base font-black text-white truncate max-w-[130px] mb-1">
              {champion.name}
            </span>
            <span className="text-sm font-black text-yellow-400 font-mono mb-2">
              {champion.score} очков
            </span>
            <div className="w-full bg-gradient-to-t from-yellow-600/40 via-yellow-500/20 to-yellow-400/30 rounded-t-2xl h-48 sm:h-60 flex flex-col items-center justify-start pt-4 border-t-4 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.3)]">
              <Trophy className="w-8 h-8 text-yellow-400 mb-1" />
              <span className="text-3xl font-black font-mono text-yellow-400">1</span>
              <span className="text-xs uppercase font-black text-yellow-300 tracking-wider">ЧЕМПИОН</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-4xl mb-2">{third.avatar}</span>
            <span className="text-xs font-bold text-white truncate max-w-[100px] mb-1">
              {third.name}
            </span>
            <span className="text-xs font-black text-amber-500 font-mono mb-2">
              {third.score} очков
            </span>
            <div className="w-full bg-gradient-to-t from-slate-900 to-amber-950/40 rounded-t-2xl h-28 sm:h-32 flex flex-col items-center justify-start pt-3 border-t-2 border-amber-600/60 shadow-lg">
              <span className="text-2xl font-black font-mono text-amber-500">3</span>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Бронза</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Restart Button */}
      <div className="pt-6 border-t border-indigo-500/20 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onRestartGame}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-base tracking-wide uppercase transition-all shadow-xl hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] flex items-center justify-center gap-2.5"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Сыграть ещё раз в лобби</span>
        </button>
      </div>
    </div>
  );
};
