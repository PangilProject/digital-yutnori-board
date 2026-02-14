import React from 'react';
import { GameNode } from '@/types/game';

interface YutNodeProps {
  /** The node data defining position, label, and type */
  node: GameNode;
}

/**
 * Component for rendering a single node (circle) on the Yutnori board.
 * Each node's size and color are determined by its type (Corner, Center, or standard).
 */
const YutNode: React.FC<YutNodeProps> = ({ node }) => {
  // Corner and center nodes are larger and more prominent
  const r = node.isCorner ? 22 : node.isCenter ? 20 : 13;
  
  return (
    <g filter="url(#nodeShadow)">
      {/* Main node circle */}
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
      {/* Inner decorative ring for major nodes */}
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
      {/* Node label (e.g., '출발', '방') */}
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
