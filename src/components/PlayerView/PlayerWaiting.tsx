import React from 'react';
import { GameRoomState, Player } from '../../types/game.ts';
import { ReactionPad } from './ReactionPad.tsx';
import { Trophy, Tv } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  currentPlayer: Player;
  onSendReaction: (emoji: string) => void;
}

export const PlayerWaiting: React.FC<Props> = ({
  roomState,
  currentPlayer,
  onSendReaction,
}) => {
  // Sort players to find player's current rank
  const sorted = [...roomState.players].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex((p) => p.id === currentPlayer.id) + 1;

  const isFinal = roomState.phase === 'FINAL_PODIUM';

  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[90vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentPlayer.avatar}</span>
          <span className="text-xs font-bold text-white">{currentPlayer.name}</span>
        </div>

        <div className="text-right">
          <span className="text-sm font-black text-yellow-400 font-mono">
            {currentPlayer.score} очков
          </span>
        </div>
      </div>

      {/* Main Status Display */}
      <div className="my-auto text-center space-y-5 bg-[#14172E] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-400/30">
          <Tv className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white">
            {isFinal ? 'Игра завершена! 🏆' : 'Смотрите на экран ТВ! 📺'}
          </h2>
          <p className="text-xs text-slate-300">
            {isFinal
              ? 'На главном экране проходит церемония награждения'
              : 'Сейчас подводятся результаты голосования'}
          </p>
        </div>

        {/* Current rank widget */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Ваше место
              </span>
              <span className="text-sm font-black text-white">
                {myRank}-е из {roomState.players.length}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-yellow-400 font-mono tabular-nums">
              {currentPlayer.score}
            </span>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              очков
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Reaction Pad */}
      <ReactionPad onSendReaction={onSendReaction} />
    </div>
  );
};
