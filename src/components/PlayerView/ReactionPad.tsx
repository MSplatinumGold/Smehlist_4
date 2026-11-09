import React from 'react';

interface Props {
  onSendReaction: (emoji: string) => void;
}

const EMOJIS = ['😂', '🔥', '💀', '👏', '😱', '💩'];

export const ReactionPad: React.FC<Props> = ({ onSendReaction }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="flex-1 py-2 px-1 rounded-xl bg-slate-800/80 active:bg-yellow-400/20 active:scale-90 text-2xl transition-transform select-none flex items-center justify-center hover:bg-slate-750"
            title="Отправить реакцию на ТВ"
          >
            {emoji}
          </button>
        ))}
      </div>
      <span className="text-[10px] text-slate-500 font-medium block text-center mt-1.5 uppercase tracking-wider">
        Нажми, чтобы бросить реакцию на ТВ
      </span>
    </div>
  );
};
