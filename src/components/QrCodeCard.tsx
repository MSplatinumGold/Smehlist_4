import React, { useMemo } from 'react';
import { generateSimpleQrMatrix } from '../utils/qrcode.ts';

interface Props {
  roomCode: string;
}

export const QrCodeCard: React.FC<Props> = ({ roomCode }) => {
  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?room=${roomCode}`;
  }, [roomCode]);

  const matrix = useMemo(() => {
    return generateSimpleQrMatrix(joinUrl);
  }, [joinUrl]);

  return (
    <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center">
      <svg
        viewBox={`0 0 ${matrix.length} ${matrix.length}`}
        className="w-32 h-32 md:w-36 md:h-36 shape-rendering-crisp"
      >
        <rect width={matrix.length} height={matrix.length} fill="#FFFFFF" />
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#0F172A"
              />
            ) : null
          )
        )}
      </svg>
      <div className="mt-2 text-center">
        <span className="text-[11px] font-bold tracking-wider text-slate-800 uppercase block">
          Сканируй камерой
        </span>
        <span className="text-[10px] text-slate-500 font-mono select-all">
          {window.location.host}/?room={roomCode}
        </span>
      </div>
    </div>
  );
};
