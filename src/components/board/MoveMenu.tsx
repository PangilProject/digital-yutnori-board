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

  // 메뉴가 보드판(0~600) 밖으로 나가지 않도록 X 좌표를 제한 (메뉴 너비 약 320)
  const menuWidth = 320;
  const menuHeight = 80;
  const halfWidth = menuWidth / 2;
  const margin = 10; // 최소 여백
  
  // foreignObject는 좌상단 좌표 기준이므로 중심 보정을 위해 x - halfWidth
  const clampedX = Math.min(Math.max(halfWidth + margin, pos.x), 600 - halfWidth - margin);
  const x = clampedX - halfWidth;
  
  // 말 위치가 구석일 때 메뉴 박스가 밀리더라도 화살표는 말을 가리키도록 오프셋 계산 (HTML 내부에서 처리하거나 근사치 사용)
  const arrowOffset = pos.x - clampedX; // 중심점으로부터의 거리

  // 보드 상단(0) 밖으로 나가지 않도록 Y 좌표도 조정
  const menuY = Math.max(90, pos.y);
  const y = menuY - 100; // 말 위쪽으로 띄움

  return (
    <foreignObject x={x} y={y} width={menuWidth} height={menuHeight + 20} className="overflow-visible">
      <div className="relative w-full h-full flex flex-col items-center justify-end pb-2">
        <div className="animate-in fade-in zoom-in-95 duration-200 origin-bottom">
          <div className="bg-white p-2 rounded-xl shadow-2xl border-2 border-primary/20 flex gap-2 whitespace-nowrap min-w-[220px] justify-center backdrop-blur-md bg-white/95">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveOption(opt.steps);
                }}
                className="w-10 h-10 rounded-full text-base font-black flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-90 transition-transform"
                style={{ backgroundColor: opt.color }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Arrow pointing to piece */}
          <div 
            className="absolute top-[calc(100%-8px)] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/95 filter drop-shadow-sm" 
            style={{ left: `calc(50% + ${arrowOffset}px)`, transform: 'translateX(-50%)' }}
          />
        </div>
      </div>
    </foreignObject>
  );
};

export default MoveMenu;
