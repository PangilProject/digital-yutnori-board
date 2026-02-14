import React from 'react';

export interface YutBoardDefsProps {
  /** 캡처 발생 시 보드가 흔들리는지 여부 */
  isShaking: boolean;
}

/**
 * 보드 전체에서 사용하는 SVG 정의(defs), 그라데이션, 필터 등을 정의하는 컴포넌트입니다.
 * 보드 배경 그라데이션, 노드 및 말의 그림자, 흔들림 애니메이션 등을 포함합니다.
 */
const YutBoardDefs: React.FC<YutBoardDefsProps> = ({ isShaking }) => {
  return (
    <defs>
      {/* 나무 질감의 배경 그라데이션 */}
      <radialGradient id="boardBg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="hsl(35, 40%, 82%)" />
        <stop offset="100%" stopColor="hsl(35, 35%, 72%)" />
      </radialGradient>

      {/* 노드에 깊이감을 주기 위한 그림자 필터 */}
      <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
      </filter>

      {/* 말이 공중에 떠 있는 것처럼 보이게 하는 그림자 필터 */}
      <filter id="pieceShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
      </filter>

      {/* 보드 테두리 프레임의 그라데이션 */}
      <linearGradient id="boardBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(30, 40%, 55%)" />
        <stop offset="100%" stopColor="hsl(30, 30%, 40%)" />
      </linearGradient>

      {/* 상대방 말을 잡았을 때 발생하는 화면 흔들림 애니메이션 */}
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
