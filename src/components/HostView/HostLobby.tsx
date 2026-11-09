import React, { useState } from 'react';
import { GameRoomState, GameSettings, PromptTag, PromptType } from '../../types/game.ts';
import { QrCodeCard } from '../QrCodeCard.tsx';
import {
  Users,
  Play,
  Bot,
  Copy,
  Check,
  Volume2,
  VolumeX,
  BookOpen,
  Sliders,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { sounds } from '../../utils/audio.ts';

interface Props {
  roomState: GameRoomState;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onAddBot: (count?: number) => void;
  onClearBots?: () => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame: () => void;
  onOpenPromptsModal: () => void;
  onBackToMenu?: () => void;
}

export const HostLobby: React.FC<Props> = ({
  roomState,
  onUpdateSettings,
  onAddBot,
  onClearBots,
  onRemovePlayer,
  onStartGame,
  onOpenPromptsModal,
  onBackToMenu,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showSettings, setShowSettings] = useState(false);

  const joinUrl = `${window.location.origin}/?room=${roomState.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTag = (tag: PromptTag) => {
    const current = roomState.settings.tags;
    let next: PromptTag[];
    if (current.includes(tag)) {
      if (current.length === 1) return; // keep at least 1
      next = current.filter((t) => t !== tag);
    } else {
      next = [...current, tag];
    }
    onUpdateSettings({ tags: next });
  };

  const toggleType = (type: PromptType) => {
    const current = roomState.settings.types;
    let next: PromptType[];
    if (current.includes(type)) {
      if (current.length === 1) return;
      next = current.filter((t) => t !== type);
    } else {
      next = [...current, type];
    }
    onUpdateSettings({ types: next });
  };

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const canStart = roomState.players.length >= 2;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col min-h-[85vh] justify-between">
      {/* Top Bar with brand and quick controls */}
      <div className="flex items-center justify-between pb-6 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={() => {
                if (window.confirm('Выйти в главное меню и закрыть эту комнату?')) {
                  onBackToMenu();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors mr-1"
              title="Выйти в меню"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>
          )}
          <span className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-yellow-400">MEH</span>LIST
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold uppercase tracking-wider">
            Экран Ведущего / ТВ
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPromptsModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
            <span>База вопросов</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              showSettings
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800/80 text-slate-200 hover:text-white border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Настройки</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Lobby Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
        {/* Left Column: Room Code & QR join panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#14172E] border border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs uppercase tracking-widest font-bold text-indigo-400 mb-2">
            Код для входа с телефона
          </span>

          {/* Big Room Code */}
          <div className="bg-slate-900/90 border-2 border-yellow-400/80 rounded-2xl px-8 py-3 my-2 shadow-[0_0_30px_rgba(250,204,21,0.25)] select-all">
            <span className="text-5xl sm:text-6xl font-black tracking-widest text-yellow-400 font-mono">
              {roomState.code}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2 mb-6 max-w-xs">
            Перейдите на сайт на телефоне или наведите камеру на QR-код ниже
          </p>

          <QrCodeCard roomCode={roomState.code} />

          <div className="mt-5 w-full">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Ссылка скопирована!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Скопировать прямую ссылку</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Players List & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Settings Drawer (expandable) */}
          {showSettings && (
            <div className="bg-[#14172E] border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold tracking-tight text-white uppercase text-indigo-300">
                Параметры игры
              </h3>

              {/* Tag filters */}
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  Категории вопросов:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['STANDARD', '18+', 'FAMILY'] as const).map((tag) => {
                    const active = roomState.settings.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? tag === '18+'
                              ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                              : tag === 'FAMILY'
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                              : 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {tag === '18+' ? '🔞 18+ (Для взрослых)' : tag === 'FAMILY' ? '🌱 Семейный' : '⚡ STANDARD'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Types */}
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  Типы заданий:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['STANDARD', 'THRIP'] as const).map((type) => {
                    const active = roomState.settings.types.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {type === 'THRIP' ? '🔥 Блиц «3 вещи» (THRIP)' : '🎯 Обычный панчлайн'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rounds & Timer */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">Раундов:</span>
                  <div className="flex gap-1.5">
                    {[2, 3, 5].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => onUpdateSettings({ roundsCount: cnt })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          roomState.settings.roundsCount === cnt
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">Время на ответ:</span>
                  <div className="flex gap-1.5">
                    {[45, 60, 90].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => onUpdateSettings({ timerSeconds: sec })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          roomState.settings.timerSeconds === sec
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sec}с
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Players List Card */}
          <div className="bg-[#14172E] border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Игроки в лобби
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    {roomState.players.length}
                  </span>
                </div>

                {/* Add bot buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => onAddBot(1)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-colors"
                    title="Добавить 1 бота"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>+1</span>
                  </button>
                  <button
                    onClick={() => onAddBot(2)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-colors"
                    title="Добавить 2 ботов"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => onAddBot(3)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-colors"
                    title="Добавить 3 ботов"
                  >
                    +3
                  </button>
                  {roomState.players.some((p) => p.isBot) && onClearBots && (
                    <button
                      onClick={onClearBots}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                      title="Удалить всех ботов"
                    >
                      Очистить
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of players or empty state */}
              {roomState.players.length === 0 ? (
                <div className="my-6 py-8 px-4 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-3xl block">📱</span>
                    <span className="text-sm font-bold text-slate-200 block">
                      Ожидаем подключения игроков со смартфонов
                    </span>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Сканируйте QR-код камерой телефона или введите код <span className="font-mono text-yellow-400 font-bold">{roomState.code}</span> на сайте.
                    </p>
                  </div>

                  {/* Prominent 1-click test button for instant play */}
                  <div className="pt-2 border-t border-slate-800/80 max-w-md mx-auto space-y-2">
                    <span className="text-[11px] uppercase font-bold text-yellow-400 tracking-wider block">
                      Хотите быстро протестировать игру прямо сейчас?
                    </span>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        onClick={() => onAddBot(2)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-4 h-4 fill-current" />
                        <span>Добавить 2 ботов для теста</span>
                      </button>
                      <button
                        onClick={() => onAddBot(3)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-4 h-4" />
                        <span>+3 бота</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 max-h-64 overflow-y-auto pr-1">
                  {roomState.players.map((player) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-2xl filter drop-shadow">{player.avatar}</span>
                        <div className="truncate">
                          <span className="text-xs font-bold text-white block truncate">
                            {player.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {player.isBot ? '🤖 Бот' : '📱 Игрок'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemovePlayer(player.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Исключить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button Zone */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {canStart
                  ? 'Все готовы! Нажмите кнопку для старта.'
                  : 'Нужно минимум 2 игрока для начала (добавьте бота или позовите друга).'}
              </span>

              <button
                onClick={onStartGame}
                disabled={!canStart}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Начать игру</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-500 py-2">
        MEHLIST · Интерактивная party-игра для вечеринок и стримов · Играйте с любого телефона
      </div>
    </div>
  );
};
