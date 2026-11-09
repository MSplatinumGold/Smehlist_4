import React from 'react';
import { GameRoomState, Player } from '../../types/game.ts';
import { ReactionPad } from './ReactionPad.tsx';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  roomState: GameRoomState;
  currentPlayer: Player;
  onSubmitVote: (battleIndex: number, votedPlayerId: string) => void;
  onSendReaction: (emoji: string) => void;
  onLeaveRoom?: () => void;
}

export const PlayerVoting: React.FC<Props> = ({
  roomState,
  currentPlayer,
  onSubmitVote,
  onSendReaction,
  onLeaveRoom,
}) => {
  const battle = roomState.battles[roomState.currentBattleIndex];
  if (!battle) return null;

  const isDuelist = battle.player1Id === currentPlayer.id || battle.player2Id === currentPlayer.id;
  // Duelists only blocked if there are other players (3+) to vote
  const isMyBattleBlocked = isDuelist && roomState.players.length > 2;
  const myVote = battle.votes[currentPlayer.id];

  const handleVote = (targetPlayerId: string) => {
    if (isMyBattleBlocked || myVote) return;
    onSubmitVote(roomState.currentBattleIndex, targetPlayerId);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[90vh] justify-between text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          {onLeaveRoom && (
            <button
              onClick={() => {
                if (window.confirm('Выйти из игры в главное меню?')) {
                  onLeaveRoom();
                }
              }}
              className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 text-xs font-semibold mr-1"
            >
              ← Выйти
            </button>
          )}
          <span className="text-xl">{currentPlayer.avatar}</span>
          <span className="text-xs font-bold text-white">{currentPlayer.name}</span>
        </div>

        <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black uppercase">
          Голосование · {roomState.timer}с
        </span>
      </div>

      {/* Main Choice Arena */}
      <div className="my-auto space-y-4">
        {isMyBattleBlocked ? (
          /* When in 3+ player room and player is one of the authors */
          <div className="bg-[#14172E] border border-yellow-400/30 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white">
              Это ваша дуэль! ⚔️
            </h3>
            <p className="text-xs text-slate-300">
              В этом баттле соревнуется ваш ответ! Жюри (остальные игроки) сейчас голосуют за вас. Болейте за свой ответ на ТВ!
            </p>
          </div>
        ) : myVote ? (
          /* When already voted */
          <div className="bg-[#14172E] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white">
              Голос учтён! 👍
            </h3>
            <p className="text-xs text-slate-300">
              Вы проголосовали за {myVote === battle.player1Id ? 'Вариант 1' : 'Вариант 2'}. Ожидаем оглашения результатов на ТВ!
            </p>
          </div>
        ) : (
          /* Voting options buttons */
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold block mb-1">
                Выберите лучший ответ
              </span>
              <p className="text-sm font-bold text-slate-300">
                «{battle.prompt.text}»
              </p>
            </div>

            {/* Option 1 Button */}
            <button
              onClick={() => handleVote(battle.player1Id)}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-indigo-900/80 to-indigo-800/80 hover:from-indigo-800 hover:to-indigo-700 active:scale-95 border-2 border-indigo-500/40 text-left transition-all shadow-xl group"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-700/50">
                <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                  Вариант 1
                </span>
                <span className="text-xs text-yellow-400 font-bold">Нажми, чтобы выбрать</span>
              </div>
              <p className="text-base font-bold text-white group-hover:text-yellow-200 transition-colors">
                {battle.answer1?.text || 'Вариант 1'}
              </p>
            </button>

            {/* Option 2 Button */}
            <button
              onClick={() => handleVote(battle.player2Id)}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-900/80 to-purple-800/80 hover:from-purple-800 hover:to-purple-700 active:scale-95 border-2 border-purple-500/40 text-left transition-all shadow-xl group"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-700/50">
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                  Вариант 2
                </span>
                <span className="text-xs text-yellow-400 font-bold">Нажми, чтобы выбрать</span>
              </div>
              <p className="text-base font-bold text-white group-hover:text-yellow-200 transition-colors">
                {battle.answer2?.text || 'Вариант 2'}
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Reaction Pad */}
      <ReactionPad onSendReaction={onSendReaction} />
    </div>
  );
};
