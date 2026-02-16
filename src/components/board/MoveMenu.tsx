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

  // 보드판 좌표(0~600)를 퍼센트로 변환하여 위치 설정
  // 오른쪽 절반에 있으면 말의 오른쪽을 기준으로 정렬하여 화면 밖으로 나가는 것을 방지
  const isRightSide = pos.x > 300;
  
  // 메뉴 전체 스타일
  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${(pos.y / 600) * 100}%`,
    zIndex: 50,
    marginTop: '-20px', // 말에서 약간 위로 띄움
    width: '320px',
    maxWidth: '90vw', // 모바일 폭 제한
    pointerEvents: 'auto',
    ...(isRightSide 
      ? { 
          left: `${(pos.x / 600) * 100}%`, 
          transform: 'translate(-85%, -100%)' // 오른쪽이면 왼쪽으로 더 많이 이동
        } 
      : { 
          left: `${(pos.x / 600) * 100}%`, 
          transform: 'translate(-15%, -100%)' // 왼쪽이면 오른쪽으로 살짝 이동
        }
    )
  };

  return (
    <div style={style}>
      <div className="relative w-full flex flex-col items-center justify-end pb-2">
        <div className="animate-in fade-in zoom-in-95 duration-200 origin-bottom">
          <div className="bg-white p-2 rounded-xl shadow-2xl border-2 border-primary/20 flex gap-2 whitespace-nowrap overflow-x-auto justify-center backdrop-blur-md bg-white/95">
            {options.map((opt) => (
              <button
                key={opt.label}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveOption(opt.steps);
                }}
                className="w-10 h-10 flex-shrink-0 rounded-full text-base font-black flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                style={{ backgroundColor: opt.color }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Arrow pointing to piece */}
          <div 
            className="absolute top-[100%] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/95 filter drop-shadow-sm" 
            style={{ 
              left: isRightSide ? '85%' : '15%', 
              transform: 'translateX(-50%)' 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MoveMenu;
