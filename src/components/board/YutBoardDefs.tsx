import React from 'react';

export interface YutBoardDefsProps {
  /** Whether the board is currently shaking due to a capture */
  isShaking: boolean;
}

/**
 * Component defining SVG definitions, gradients, and filters used across the board.
 * Includes the board background gradient, shadows for nodes/pieces, and the shake animation.
 */
const YutBoardDefs: React.FC<YutBoardDefsProps> = ({ isShaking }) => {
  return (
    <defs>
      {/* Wooden texture background gradient */}
      <radialGradient id="boardBg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="hsl(35, 40%, 82%)" />
        <stop offset="100%" stopColor="hsl(35, 35%, 72%)" />
      </radialGradient>

      {/* Shadow for board nodes to give depth */}
      <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
      </filter>

      {/* Shadow for game pieces to make them appear elevated */}
      <filter id="pieceShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
      </filter>

      {/* Border gradient for the board frame */}
      <linearGradient id="boardBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(30, 40%, 55%)" />
        <stop offset="100%" stopColor="hsl(30, 30%, 40%)" />
      </linearGradient>

      {/* Screen shake animation triggered during capture events */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(0,0) rotate(0); }
          10% { transform: translate(-5px,-5px) rotate(-1deg); }
          20% { transform: translate(5px,5px) rotate(1deg); }
          30% { transform: translate(-5px,5px) rotate(-1deg); }
          40% { transform: translate(5px,-5px) rotate(1deg); }
          50% { transform: translate(-5px,-5px) rotate(-1deg); }
          60% { transform: translate(5px,5px) rotate(1deg); }
          70% { transform: translate(-5px,5px) rotate(-1deg); }
          80% { transform: translate(5px,-5px) rotate(1deg); }
          90% { transform: translate(-5px,-5px) rotate(-1deg); }
          100% { transform: translate(0,0) rotate(0); }
        }
        .shake-it { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </defs>
  );
};

export default YutBoardDefs;
