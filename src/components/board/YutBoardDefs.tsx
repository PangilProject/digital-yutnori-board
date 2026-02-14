import React from 'react';

interface YutBoardDefsProps {
  isShaking: boolean;
}

const YutBoardDefs: React.FC<YutBoardDefsProps> = ({ isShaking }) => {
  return (
    <defs>
      <radialGradient id="boardBg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="hsl(35, 40%, 82%)" />
        <stop offset="100%" stopColor="hsl(35, 35%, 72%)" />
      </radialGradient>
      <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
      </filter>
      <filter id="pieceShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
      </filter>
      <linearGradient id="boardBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(30, 40%, 55%)" />
        <stop offset="100%" stopColor="hsl(30, 30%, 40%)" />
      </linearGradient>
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
