import React from 'react';

interface MoveMenuProps {
  /** The position above which the menu should appear */
  pos: { x: number; y: number };
  /** Callback triggered when a move option is selected */
  onMoveOption: (steps: number) => void;
}

/**
 * Component for movement options tooltip (도, 개, 걸, 윷, 모, 빽도).
 * Appears when a piece is clicked/tapped, enabling strategic movement choices.
 */
const MoveMenu: React.FC<MoveMenuProps> = ({ pos, onMoveOption }) => {
  // Move values and corresponding traditional Korean labels
  const options = [
    { label: '도', steps: 1, color: 'hsl(200, 70%, 50%)' },
    { label: '개', steps: 2, color: 'hsl(180, 70%, 45%)' },
    { label: '걸', steps: 3, color: 'hsl(150, 70%, 40%)' },
    { label: '윷', steps: 4, color: 'hsl(45, 90%, 50%)' },
    { label: '모', steps: 5, color: 'hsl(25, 90%, 50%)' },
    { label: '빽', steps: -1, color: 'hsl(0, 0%, 40%)' },
  ];

  return (
    <g className="animate-in fade-in zoom-in duration-200" transform={`translate(${pos.x}, ${pos.y - 45})`}>
      {/* Semi-transparent white background with glassmorphism feel */}
      <rect x="-105" y="-30" width="210" height="60" rx="12" fill="white" filter="url(#nodeShadow)" fillOpacity="0.9" />
      <path d="M -8 30 L 0 38 L 8 30 Z" fill="white" fillOpacity="0.9" />
      
      {options.map((opt, i) => (
        <g 
          key={opt.label} 
          transform={`translate(${-85 + i * 34}, 0)`} 
          style={{ cursor: 'pointer' }}
          onPointerDown={(e) => e.stopPropagation()} // Prevent deselecting the piece
          onClick={(e) => {
            e.stopPropagation();
            onMoveOption(opt.steps);
          }}
        >
          {/* Circular button for each move option */}
          <circle r="14" fill={opt.color} className="hover:filter hover:brightness-110 transition-all" />
          <text 
            textAnchor="middle" 
            dominantBaseline="central" 
            fontSize="12" 
            fontWeight="bold" 
            fill="white"
            pointerEvents="none"
          >
            {opt.label}
          </text>
          {/* Small move count indicator (e.g., +3) */}
          <text
            y="20"
            textAnchor="middle"
            fontSize="8"
            fill="hsl(0, 0%, 40%)"
            fontWeight="bold"
            pointerEvents="none"
          >
            {opt.steps > 0 ? `+${opt.steps}` : opt.steps}
          </text>
        </g>
      ))}
    </g>
  );
};

export default MoveMenu;
