import React from 'react';
import { GameRoomState } from '../../types/game.ts';
import { Clock, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
}

export const HostAnswering: React.FC<Props> = ({ roomState }) => {
  const percentTimeLeft = Math.max(0, (roomState.timer / roomState.maxTimer) * 100);

  // Calculate answer progress for each player
  const playerAnsweredMap: Record<string, boolean> = {};
  roomState.battles.forEach((b) => {
    if (b.answer1) playerAnsweredMap[b.player1Id] = true;
    if (b.answer2) playerAnsweredMap[b.player2Id] = true;
  });

  const totalAnsweringPlayers = roomState.players.length;
  const answeredCount = Object.keys(playerAnsweredMap).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col min-h-[85vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
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

      {/* Center Stage */}
      <div className="my-auto text-center space-y-8 py-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
          Игроки придумывают ответы на смартфонах
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Пишите самое смешное, что придёт в голову! ✍️🔥
        </h1>

        <p className="text-base text-slate-300 max-w-xl mx-auto">
          Каждый ответ столкнётся лицом к лицу с ответом соперника в ожесточённом комедийном баттле.
        </p>

        {/* Big circular or bar countdown */}
        <div className="max-w-md mx-auto w-full bg-slate-900/90 rounded-full h-4 overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              roomState.timer <= 10 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
            }`}
            style={{ width: `${percentTimeLeft}%` }}
          />
        </div>
      </div>

      {/* Bottom Checklist of players answering */}
      <div className="bg-[#14172E] border border-indigo-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Ответили: {answeredCount} из {totalAnsweringPlayers}
          </span>
          <span className="text-slate-400 font-mono">
            {answeredCount === totalAnsweringPlayers ? 'Все сдали ответы! Переход к баттлам...' : 'Ждём остальных...'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {roomState.players.map((p) => {
            const hasAnswered = !!playerAnsweredMap[p.id];
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  hasAnswered
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xl">{p.avatar}</span>
                  <span className="text-xs font-bold truncate">{p.name}</span>
                </div>
                {hasAnswered ? (
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
