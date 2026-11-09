import React from 'react';
import { ReactionEvent } from '../types/game.ts';

interface Props {
  reactions: ReactionEvent[];
}

export const FloatingReactions: React.FC<Props> = ({ reactions }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {reactions.map((rx) => (
        <div
          key={rx.id}
          style={{
            left: `${rx.x}%`,
            bottom: '10%',
            animation: 'floatUp 3.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
          className="absolute flex flex-col items-center select-none"
        >
          <span className="text-4xl md:text-6xl drop-shadow-lg filter">{rx.emoji}</span>
          <span className="text-[11px] font-semibold text-slate-300 bg-black/60 px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
            {rx.playerName}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.6);
          }
          15% {
            opacity: 1;
            transform: translateY(0) scale(1.15);
          }
          80% {
            opacity: 1;
            transform: translateY(-220px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-300px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};
