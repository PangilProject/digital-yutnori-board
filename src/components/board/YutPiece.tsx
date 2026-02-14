import React from 'react';
import { Piece, TeamConfig } from '@/types/game';

interface YutPieceProps {
  /** The specific piece data */
  piece: Piece;
  /** Configuration for the piece's team (color, emoji) */
  team: TeamConfig;
  /** Current absolute SVG coordinates for the piece */
  pos: { x: number; y: number };
  /** Number of pieces stacked together (업기) */
  count: number;
  /** Whether the piece is currently being dragged by the user */
  isDragging: boolean;
  /** Interaction handler for pointer down events */
  onPointerDown: (e: React.PointerEvent) => void;
  /** Base radius for the piece circle */
  radius: number;
}

/**
 * Component for rendering a game piece.
 * Includes visual treatment for dragging, team colors, and a "stack count" badge (업기).
 */
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
      {/* Outer piece body using team's primary color */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius}
        fill={team.color}
        stroke={isDragging ? 'hsl(45, 100%, 60%)' : team.colorLight}
        strokeWidth={isDragging ? 3 : 2}
      />
      {/* Inner decorative circle using team's light color */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius * 0.56}
        fill={team.colorLight}
        pointerEvents="none"
      />
      {/* Subtle shine effect for a premium look */}
      <circle
        cx={pos.x - (radius * 0.25)}
        cy={pos.y - (radius * 0.3)}
        r={radius * 0.25}
        fill="rgba(255,255,255,0.35)"
        pointerEvents="none"
      />
      {/* Stack badge (e.g., ×2) shown when multiple pieces move together */}
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
