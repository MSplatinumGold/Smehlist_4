import React, { useState, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket.ts';
import { FloatingReactions } from './components/FloatingReactions.tsx';
import { PromptManagerModal } from './components/PromptManagerModal.tsx';
import { HostLobby } from './components/HostView/HostLobby.tsx';
import { HostAnswering } from './components/HostView/HostAnswering.tsx';
import { HostBattleShowdown } from './components/HostView/HostBattleShowdown.tsx';
import { HostRevealResults } from './components/HostView/HostRevealResults.tsx';
import { HostRoundSummary } from './components/HostView/HostRoundSummary.tsx';
import { HostFinalPodium } from './components/HostView/HostFinalPodium.tsx';
import { PlayerJoin } from './components/PlayerView/PlayerJoin.tsx';
import { PlayerLobby } from './components/PlayerView/PlayerLobby.tsx';
import { PlayerAnswering } from './components/PlayerView/PlayerAnswering.tsx';
import { PlayerVoting } from './components/PlayerView/PlayerVoting.tsx';
import { PlayerWaiting } from './components/PlayerView/PlayerWaiting.tsx';
import { Tv, Smartphone, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const {
    roomState,
    playerId,
    isHost,
    errorMsg,
    floatingReactions,
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useGameSocket();

  // Mode: 'SELECT' | 'HOST' | 'CONTROLLER'
  const [appMode, setAppMode] = useState<'SELECT' | 'HOST' | 'CONTROLLER'>('SELECT');
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);

  // Read URL query parameter ?room=XYZ
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setInitialRoomCode(urlRoom.toUpperCase());
        setAppMode('CONTROLLER');
      }
    }
  }, []);

  // Sync mode if already joined with host session
  useEffect(() => {
    if (roomState) {
      if (isHost) {
        setAppMode('HOST');
      } else {
        setAppMode('CONTROLLER');
      }
    }
  }, [roomState, isHost]);

  // Current player helper
  const currentPlayer = roomState?.players.find((p) => p.id === playerId);

  const handleBackToMenu = () => {
    leaveRoom();
    setAppMode('SELECT');
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleBackToLobby = () => {
    sendMessage({ type: 'RESTART_GAME' });
  };

  return (
    <div className="min-h-screen bg-[#0B0D1B] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Floating Reactions across screen */}
      <FloatingReactions reactions={floatingReactions} />

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Screen Routing */}
      {appMode === 'SELECT' && !roomState ? (
        /* Home Landing Mode Selector */
        <div className="max-w-2xl mx-auto px-4 py-12 my-auto flex flex-col items-center text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-black uppercase tracking-widest border border-indigo-500/30">
              Интерактивная игра для компании
            </span>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white">
              <span className="text-yellow-400">MEH</span>LIST
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
              Придумывайте самые смешные ответы на острые вопросы, устраивайте баттлы и голосуйте со своих смартфонов!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
            {/* Host TV Screen Card */}
            <button
              onClick={() => {
                setAppMode('HOST');
                createRoom('Ведущий', '👑');
              }}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#181C38] to-[#12152C] border-2 border-indigo-500/40 hover:border-yellow-400 text-left transition-all shadow-2xl group flex flex-col justify-between h-56"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors">
                  Создать комнату (ТВ / Экран)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Откройте на ноутбуке, проекторе или телевизоре для показа кода и баттлов.
                </p>
              </div>
              <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                Открыть экран ведущего →
              </span>
            </button>

            {/* Controller Mobile Card */}
            <button
              onClick={() => setAppMode('CONTROLLER')}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#181C38] to-[#12152C] border-2 border-indigo-500/40 hover:border-indigo-400 text-left transition-all shadow-2xl group flex flex-col justify-between h-56"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                  Войти как игрок
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Подключитесь с телефона по 4-значному коду из экрана комнаты.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                Подключиться со смартфона →
              </span>
            </button>
          </div>

          {/* Quick Bank & AI button */}
          <div className="pt-4">
            <button
              onClick={() => setIsPromptsModalOpen(true)}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Посмотреть базу заданий и генератор ИИ</span>
            </button>
          </div>
        </div>
      ) : appMode === 'HOST' ? (
        /* Host Mode */
        !roomState ? (
          /* Host Loading / Creating Screen */
          <div className="max-w-md mx-auto px-4 py-20 my-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-400/30 animate-pulse">
              <Tv className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Создаем комнату для ТВ...</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Генерация 4-значного кода и настройка экрана вечеринки
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleBackToMenu}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
          {roomState.phase === 'LOBBY' && (
            <HostLobby
              roomState={roomState}
              onUpdateSettings={(settings) => sendMessage({ type: 'UPDATE_SETTINGS', payload: { settings } })}
              onAddBot={(count) => sendMessage({ type: 'ADD_BOT', payload: { count } })}
              onClearBots={() => sendMessage({ type: 'CLEAR_BOTS' })}
              onRemovePlayer={(playerId) => sendMessage({ type: 'REMOVE_PLAYER', payload: { playerId } })}
              onStartGame={() => sendMessage({ type: 'START_GAME' })}
              onOpenPromptsModal={() => setIsPromptsModalOpen(true)}
              onBackToMenu={handleBackToMenu}
            />
          )}

          {roomState.phase === 'PROMPTS' && (
            <HostAnswering
              roomState={roomState}
              onBackToLobby={handleBackToLobby}
              onBackToMenu={handleBackToMenu}
            />
          )}

          {roomState.phase === 'VOTING' && (
            <HostBattleShowdown
              roomState={roomState}
              onVote={(battleIndex, votedPlayerId) =>
                sendMessage({ type: 'SUBMIT_VOTE', payload: { battleIndex, votedPlayerId } })
              }
              onBackToLobby={handleBackToLobby}
            />
          )}

          {roomState.phase === 'REVEAL' && (
            <HostRevealResults
              roomState={roomState}
              onNextBattle={() => sendMessage({ type: 'NEXT_BATTLE' })}
              onBackToLobby={handleBackToLobby}
            />
          )}

          {roomState.phase === 'ROUND_SUMMARY' && (
            <HostRoundSummary
              roomState={roomState}
              onNextRound={() => sendMessage({ type: 'NEXT_ROUND' })}
              onBackToLobby={handleBackToLobby}
            />
          )}

          {roomState.phase === 'FINAL_PODIUM' && (
            <HostFinalPodium
              roomState={roomState}
              onRestartGame={() => sendMessage({ type: 'RESTART_GAME' })}
              onBackToMenu={handleBackToMenu}
            />
          )}
        </div>
        )
      ) : (
        /* Controller / Player Views */
        <div className="flex-1 flex flex-col">
          {!roomState || !currentPlayer ? (
            <PlayerJoin
              initialCode={initialRoomCode}
              onJoin={(code, name, avatar) => joinRoom(code, name, avatar)}
              onSwitchToHost={() => {
                setAppMode('HOST');
                createRoom('Ведущий', '👑');
              }}
              onBackToMenu={handleBackToMenu}
            />
          ) : (
            <>
              {roomState.phase === 'LOBBY' && (
                <PlayerLobby
                  roomState={roomState}
                  currentPlayer={currentPlayer}
                  onSendReaction={(emoji) => sendMessage({ type: 'SEND_REACTION', payload: { emoji } })}
                  onLeaveRoom={handleBackToMenu}
                  onAddBot={(count) => sendMessage({ type: 'ADD_BOT', payload: { count } })}
                />
              )}

              {roomState.phase === 'PROMPTS' && (
                <PlayerAnswering
                  roomState={roomState}
                  currentPlayer={currentPlayer}
                  onSubmitAnswer={(promptId, text, thripItems) =>
                    sendMessage({ type: 'SUBMIT_ANSWER', payload: { promptId, text, thripItems } })
                  }
                  onSendReaction={(emoji) => sendMessage({ type: 'SEND_REACTION', payload: { emoji } })}
                  onLeaveRoom={handleBackToMenu}
                />
              )}

              {roomState.phase === 'VOTING' && (
                <PlayerVoting
                  roomState={roomState}
                  currentPlayer={currentPlayer}
                  onSubmitVote={(battleIndex, votedPlayerId) =>
                    sendMessage({ type: 'SUBMIT_VOTE', payload: { battleIndex, votedPlayerId } })
                  }
                  onSendReaction={(emoji) => sendMessage({ type: 'SEND_REACTION', payload: { emoji } })}
                  onLeaveRoom={handleBackToMenu}
                />
              )}

              {(roomState.phase === 'REVEAL' ||
                roomState.phase === 'ROUND_SUMMARY' ||
                roomState.phase === 'FINAL_PODIUM') && (
                <PlayerWaiting
                  roomState={roomState}
                  currentPlayer={currentPlayer}
                  onSendReaction={(emoji) => sendMessage({ type: 'SEND_REACTION', payload: { emoji } })}
                  onLeaveRoom={handleBackToMenu}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Prompts Inspection & Custom Addition Modal */}
      <PromptManagerModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
      />
    </div>
  );
}
