import React from 'react';

interface MoveMenuProps {
  /** 메뉴가 나타날 말의 위치 좌표 */
  pos: { x: number; y: number };
  /** 옵션 선택 시 호출되는 콜백 함수 (이동 칸 수 전달) */
  onMoveOption: (steps: number) => void;
}

/**
 * 말 이동 옵션(도, 개, 걸, 윷, 모, 빽도)을 보여주는 툴팁 메뉴 컴포넌트입니다.
 * 말을 클릭했을 때 나타나며, 사용자가 전략적으로 이동 거리를 선택할 수 있게 합니다.
 */
const MoveMenu: React.FC<MoveMenuProps> = ({ pos, onMoveOption }) => {
  // 윷놀이 이동 값과 그에 해당하는 전통 명칭 및 색상 설정
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
      {/* 반투명한 흰색 배경 (Glassmorphism 느낌) */}
      <rect x="-105" y="-30" width="210" height="60" rx="12" fill="white" filter="url(#nodeShadow)" fillOpacity="0.9" />
      <path d="M -8 30 L 0 38 L 8 30 Z" fill="white" fillOpacity="0.9" />
      
      {options.map((opt, i) => (
        <g 
          key={opt.label} 
          transform={`translate(${-85 + i * 34}, 0)`} 
          style={{ cursor: 'pointer' }}
          onPointerDown={(e) => e.stopPropagation()} // 클릭 시 선택된 말이 해제되지 않도록 전파 중단
          onClick={(e) => {
            e.stopPropagation();
            onMoveOption(opt.steps);
          }}
        >
          {/* 각 이동 옵션을 나타내는 원형 버튼 */}
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
          {/* 하단에 표시되는 작은 이동 수 지표 (예: +3) */}
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
