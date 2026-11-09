import React from 'react';
import { GameRoomState, Player } from '../../types/game.ts';
import { ReactionPad } from './ReactionPad.tsx';
import { Loader2, Users, CheckCircle2, Bot } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  currentPlayer: Player;
  onSendReaction: (emoji: string) => void;
  onLeaveRoom: () => void;
  onAddBot?: (count?: number) => void;
}

export const PlayerLobby: React.FC<Props> = ({
  roomState,
  currentPlayer,
  onSendReaction,
  onLeaveRoom,
  onAddBot,
}) => {
  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[90vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Вы уверены, что хотите выйти из комнаты в главное меню?')) {
                onLeaveRoom();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors mr-1"
            title="Выйти в меню"
          >
            <span>← Выйти</span>
          </button>
          <span className="text-2xl">{currentPlayer.avatar}</span>
          <div>
            <span className="text-sm font-black text-white block leading-tight">
              {currentPlayer.name}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              В сети
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Комната</span>
          <span className="text-lg font-black text-yellow-400 font-mono">
            {roomState.code}
          </span>
        </div>
      </div>

      {/* Center Status Card */}
      <div className="my-auto text-center space-y-5 bg-[#14172E] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white">
            Вы в игре!
          </h2>
          <p className="text-xs text-slate-300">
            Посматривайте на ТВ-экран. Игра начнётся, как только ведущий нажмёт «Старт».
          </p>
        </div>

        {/* Players mini list */}
        <div className="pt-4 border-t border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5" /> В комнате ({roomState.players.length}):
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Готовы
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {roomState.players.map((p) => (
              <span
                key={p.id}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
              >
                <span>{p.avatar}</span>
                <span className="font-medium truncate max-w-[90px]">{p.name}</span>
              </span>
            ))}
          </div>

          {roomState.players.length < 2 && onAddBot && (
            <button
              onClick={() => onAddBot(1)}
              className="mt-3 w-full py-2.5 px-3 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-900/80 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Добавить бота для теста (+1)</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Reaction Pad */}
      <div className="space-y-3">
        <ReactionPad onSendReaction={onSendReaction} />

        <div className="text-center">
          <button
            onClick={onLeaveRoom}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            Выйти из комнаты
          </button>
        </div>
      </div>
    </div>
  );
};
