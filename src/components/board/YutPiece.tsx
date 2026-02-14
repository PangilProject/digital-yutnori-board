import React from 'react';
import { Piece, TeamConfig } from '@/types/game';

interface YutPieceProps {
  /** 말의 고유 데이터 */
  piece: Piece;
  /** 말이 속한 팀의 설정 (색상, 이모지 등) */
  team: TeamConfig;
  /** 말의 현재 절대 SVG 좌표 */
  pos: { x: number; y: number };
  /** 함께 업힌 말의 총 개수 */
  count: number;
  /** 사용자가 현재 말을 드래그 중인지 여부 */
  isDragging: boolean;
  /** 포인터 다운 이벤트 핸들러 */
  onPointerDown: (e: React.PointerEvent) => void;
  /** 말의 기본 원 반지름 */
  radius: number;
}

/**
 * 게임 말을 그리는 컴포넌트입니다.
 * 드래그 상태에 따른 시각 효과, 팀 색상, 업기 상태를 나타내는 '스택 배지'를 포함합니다.
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
      {/* 팀의 기본 색상을 사용하는 말 본체 */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius}
        fill={team.color}
        stroke={isDragging ? 'hsl(45, 100%, 60%)' : team.colorLight}
        strokeWidth={isDragging ? 3 : 2}
      />
      {/* 팀의 연한 색상을 사용하는 내부 장식 원 */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={radius * 0.56}
        fill={team.colorLight}
        pointerEvents="none"
      />
      {/* 프리미엄한 느낌을 주기 위한 입체감(광택) 효과 */}
      <circle
        cx={pos.x - (radius * 0.25)}
        cy={pos.y - (radius * 0.3)}
        r={radius * 0.25}
        fill="rgba(255,255,255,0.35)"
        pointerEvents="none"
      />
      {/* '업기' 상태일 때 나타나는 배지 (예: ×2) */}
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
