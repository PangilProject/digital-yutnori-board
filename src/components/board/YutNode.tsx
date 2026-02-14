import React from 'react';
import { GameNode } from '@/types/game';

interface YutNodeProps {
  /** 노드 위치, 라벨, 타입 등을 정의하는 데이터 */
  node: GameNode;
}

/**
 * 윷놀이 보드의 개별 노드(원)를 그리는 컴포넌트입니다.
 * 노드의 타입(모서리, 중앙, 일반)에 따라 크기와 색상이 결정됩니다.
 */
const YutNode: React.FC<YutNodeProps> = ({ node }) => {
  // 모서리와 중앙 노드는 더 크고 눈에 띄게 표시
  const r = node.isCorner ? 22 : node.isCenter ? 20 : 13;
  
  return (
    <g filter="url(#nodeShadow)">
      {/* 노드 본체 원 */}
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill={
          node.isCorner
            ? 'hsl(30, 35%, 48%)'
            : node.isCenter
            ? 'hsl(25, 40%, 45%)'
            : 'hsl(32, 28%, 60%)'
        }
        stroke="hsl(28, 25%, 38%)"
        strokeWidth="2"
      />
      {/* 주요 노드(모서리, 중앙)의 내부 장식 링 */}
      {(node.isCorner || node.isCenter) && (
        <circle
          cx={node.x}
          cy={node.y}
          r={r - 5}
          fill="none"
          stroke="hsl(35, 30%, 65%)"
          strokeWidth="1"
        />
      )}
      {/* 노드 라벨 (예: '출발', '방', '모') */}
      {node.label && (
        <text
          x={node.x}
          y={node.y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={node.isCorner ? 11 : 10}
          fontWeight="bold"
          fill="hsl(40, 20%, 92%)"
          pointerEvents="none"
        >
          {node.label}
        </text>
      )}
    </g>
  );
};

export default YutNode;
