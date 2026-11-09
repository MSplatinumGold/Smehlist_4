import React from 'react';
import { GameRoomState } from '../../types/game.ts';
import { Clock, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  onBackToMenu?: () => void;
  onBackToLobby?: () => void;
}

export const HostAnswering: React.FC<Props> = ({ roomState, onBackToMenu, onBackToLobby }) => {
  const percentTimeLeft = Math.max(0, (roomState.timer / roomState.maxTimer) * 100);

  // Calculate answer progress for each player
  const playerProgressMap: Record<string, { done: number; total: number }> = {};
  roomState.players.forEach((p) => {
    const assigned = roomState.battles.filter((b) => b.player1Id === p.id || b.player2Id === p.id);
    const done = assigned.filter(
      (b) => (b.player1Id === p.id && !!b.answer1) || (b.player2Id === p.id && !!b.answer2)
    ).length;
    playerProgressMap[p.id] = { done, total: assigned.length };
  });

  const allPlayersDone = roomState.players.every((p) => {
    const prog = playerProgressMap[p.id];
    return prog && prog.done === prog.total;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col min-h-[88vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          {(onBackToLobby || onBackToMenu) && (
            <button
              onClick={() => {
                if (window.confirm('Прервать раунд и вернуться?')) {
                  if (onBackToLobby) onBackToLobby();
                  else if (onBackToMenu) onBackToMenu();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors mr-1"
              title="Назад"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>
          )}

          <span className="text-2xl font-black text-yellow-400">РАУНД {roomState.currentRound}</span>
          <span className="text-xs text-slate-400">из {roomState.totalRounds}</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-indigo-500/30">
          <Clock className={`w-5 h-5 ${roomState.timer <= 10 ? 'text-rose-400 animate-pulse' : 'text-yellow-400'}`} />
          <span className="text-2xl font-black font-mono tabular-nums text-white">
            {roomState.timer}
          </span>
          <span className="text-xs text-slate-400 uppercase font-semibold">сек</span>
        </div>
      </div>

      {/* Center Stage: Title + Distinct Active Prompts Grid */}
      <div className="my-auto text-center space-y-6 py-4">
        <div className="space-y-2">
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
            Игроки отвечают на разные задания одновременно на смартфонах
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Пишите самое смешное, что придёт в голову! ✍️🔥
          </h1>
        </div>

        {/* Big countdown bar */}
        <div className="max-w-md mx-auto w-full bg-slate-900/90 rounded-full h-3.5 overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              roomState.timer <= 10 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
            }`}
            style={{ width: `${percentTimeLeft}%` }}
          />
        </div>

        {/* Active Prompts in this round (simultaneous questions) */}
        <div className="pt-2">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-3">
            Задания этого раунда в игре ({roomState.battles.length}):
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto text-left">
            {roomState.battles.map((b, idx) => (
              <div
                key={b.promptId}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-2.5 shadow-md"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 block">
                    {b.prompt.type === 'THRIP' ? '«3 вещи»' : 'Панчлайн'} · {b.prompt.tag}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug line-clamp-2">
                    «{b.prompt.text}»
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Checklist of players answering with per-player progress */}
      <div className="bg-[#14172E] border border-indigo-500/20 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Прогресс игроков ({roomState.players.length})
          </span>
          <span className="text-slate-400 font-mono">
            {allPlayersDone ? 'Все сдали ответы! Переход к баттлам...' : 'Игроки вводят ответы...'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {roomState.players.map((p) => {
            const prog = playerProgressMap[p.id] || { done: 0, total: 1 };
            const isFinished = prog.done === prog.total;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isFinished
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xl">{p.avatar}</span>
                  <div className="truncate">
                    <span className="text-xs font-bold truncate block">{p.name}</span>
                    <span className="text-[10px] text-yellow-400 font-mono block">
                      {prog.done}/{prog.total}
                    </span>
                  </div>
                </div>
                {isFinished ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-slate-500 animate-spin shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
