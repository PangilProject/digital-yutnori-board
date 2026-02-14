import React from 'react';

interface CaptureEffectComponentProps {
  /** The position and unique ID of the capture effect */
  effect: { x: number; y: number; id: string };
}

/**
 * Component rendering the visual feedback for capturing an opponent's piece.
 * Includes shockwave circles and an animated fire/explosion emoji.
 */
const CaptureEffectComponent: React.FC<CaptureEffectComponentProps> = ({ effect }) => {
  return (
    <g key={effect.id}>
      {/* Expanding shockwaves for visual impact */}
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
      
      {/* Central explosion emoji with rotation and scale animations */}
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
