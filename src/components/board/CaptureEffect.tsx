import React from 'react';

interface CaptureEffectComponentProps {
  /** 캡처 효과의 위치와 고유 ID */
  effect: { x: number; y: number; id: string };
}

/**
 * 상대방의 말을 잡았을 때 나타나는 시각적 피드백 효과를 렌더링하는 컴포넌트입니다.
 * 여러 겹의 퍼져나가는 충격파 원과 화염/폭발 이모지 애니메이션으로 구성됩니다.
 */
const CaptureEffectComponent: React.FC<CaptureEffectComponentProps> = ({ effect }) => {
  return (
    <g key={effect.id}>
      {/* 강렬한 시각적 타격감을 위해 퍼져나가는 충격파 효과들 */}
      <circle cx={effect.x} cy={effect.y} r={10} fill="none" stroke="white" strokeWidth="4">
        <animate attributeName="r" from="10" to="100" dur="0.6s" repeatCount="1" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="0.6s" repeatCount="1" fill="freeze" />
      </circle>
      <circle cx={effect.x} cy={effect.y} r={15} fill="none" stroke="hsl(0, 100%, 50%)" strokeWidth="8">
        <animate attributeName="r" from="15" to="80" dur="0.8s" repeatCount="1" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="0.8s" repeatCount="1" fill="freeze" />
      </circle>
      <circle cx={effect.x} cy={effect.y} r={20} fill="none" stroke="hsl(45, 100%, 50%)" strokeWidth="4">
        <animate attributeName="r" from="20" to="60" dur="1s" repeatCount="1" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="1" fill="freeze" />
      </circle>
      
      {/* 중앙의 폭발 이모지 - 크기 변화와 회전 애니메이션 적용 */}
      <text
        x={effect.x}
        y={effect.y}
        fontSize="48"
        textAnchor="middle"
        dominantBaseline="central"
        filter="drop-shadow(0 0 10px rgba(255,0,0,0.5))"
      >
        🔥 💥 🔥
        <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="1" fill="freeze" />
        <animateTransform attributeName="transform" type="scale" from="0.2" to="1.8" dur="0.6s" repeatCount="1" />
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.5s" repeatCount="1" additive="sum" />
      </text>
    </g>
  );
};

export default CaptureEffectComponent;
