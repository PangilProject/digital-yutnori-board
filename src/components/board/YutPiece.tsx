import React from 'react';
import { Piece, TeamConfig } from '@/types/game';

interface YutPieceProps {
  piece: Piece;
  team: TeamConfig;
  pos: { x: number; y: number };
  count: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  radius: number;
}

const YutPiece: React.FC<YutPieceProps> = ({ 
  piece, 
  team, 
  pos, 
  count, 
  isDragging, 
  onPointerDown,
  radius
}) => {
  return (
    <g
      style={{ cursor: 'grab', opacity: isDragging ? 0.85 : 1 }}
      filter={isDragging ? undefined : 'url(#pieceShadow)'}
      onPointerDown={onPointerDown}
    >
      {/* Piece body */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius}
        fill={team.color}
        stroke={isDragging ? 'hsl(45, 100%, 60%)' : team.colorLight}
        strokeWidth={isDragging ? 3 : 2}
      />
      {/* Piece inner ring */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius * 0.56}
        fill={team.colorLight}
        pointerEvents="none"
      />
      {/* Piece shine */}
      <circle
        cx={pos.x - (radius * 0.25)}
        cy={pos.y - (radius * 0.3)}
        r={radius * 0.25}
        fill="rgba(255,255,255,0.35)"
        pointerEvents="none"
      />
      {/* Stack badge */}
      {count > 1 && (
        <g pointerEvents="none">
          <circle
            cx={pos.x + 13}
            cy={pos.y - 13}
            r={9}
            fill="hsl(45, 95%, 55%)"
            stroke="hsl(35, 50%, 30%)"
            strokeWidth="1.5"
          />
          <text
            x={pos.x + 13}
            y={pos.y - 12}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="bold"
            fill="hsl(35, 50%, 12%)"
          >
            ×{count}
          </text>
        </g>
      )}
    </g>
  );
};

export default YutPiece;
