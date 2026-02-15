import React, { useEffect, useState } from 'react';

interface GoalNarratorProps {
  teamName: string;
  count: number;
  id: string;
}

/**
 * 말이 골인(Finish)했을 때 화면 중앙에 화사한 축하 효과를 주는 애니메이션 오버레이입니다.
 */
const GoalNarrator: React.FC<GoalNarratorProps> = ({ teamName, count, id }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [id]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* 화사한 배경 발광 효과 (Gold/Yellow) */}
      <div className="absolute inset-0 bg-amber-400/5 backdrop-blur-[1px] animate-in fade-in duration-500" />
      
      {/* 중앙 임팩트 박스 */}
      <div className="relative flex flex-col items-center justify-center scale-150 md:scale-[2.5] animate-in zoom-in-50 slide-in-from-top-10 duration-500 ease-out">
        
        {/* 뒤쪽 황금빛 후광 */}
        <div className="absolute inset-0 bg-amber-400/20 blur-[100px] rounded-full animate-pulse" />
        
        {/* 장식용 선 (Gold) */}
        <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4 opacity-50" />
        
        <div className="relative bg-white/95 dark:bg-slate-900/95 px-8 py-5 rounded-[2.5rem] shadow-[0_10px_60px_rgba(245,158,11,0.3)] border-4 border-amber-400/40 flex flex-col items-center gap-1">
          <div className="relative">
            <span className="text-4xl animate-bounce inline-block">🏁</span>
            {/* 주변 꽃가루 입자 (Emoji) */}
            <span className="absolute -top-2 -left-4 text-xl animate-ping opacity-70">✨</span>
            <span className="absolute -bottom-2 -right-4 text-xl animate-pulse opacity-70 delay-150">🎉</span>
          </div>
          
          <h2 className="text-3xl font-[1000] tracking-tighter uppercase italic text-amber-600 dark:text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] mt-1">
            FINISH!
          </h2>
          
          <div className="flex flex-col items-center mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
              Clear The Path
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 whitespace-nowrap mt-1">
              <span className="text-amber-600 dark:text-amber-500 underline decoration-2 underline-offset-4">{teamName}</span> 팀의 말 
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-lg mx-1 inline-block transform rotate-2">{count}개</span>가 
              <span className="text-amber-600 ml-1 italic">골인 성공!</span> 
            </p>
          </div>
        </div>

        {/* 장식용 선 (Gold) */}
        <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-4 opacity-50" />
      </div>

      {/* 주변 장식 애니메이션 */}
      <div className="absolute top-1/5 left-1/3 text-4xl animate-in zoom-in slide-in-from-left-20 duration-700 opacity-20">🎉</div>
      <div className="absolute bottom-1/5 right-1/3 text-4xl animate-in zoom-in slide-in-from-right-20 duration-1000 opacity-20 delay-300">🏅</div>
      <div className="absolute top-1/2 left-1/5 text-4xl animate-in zoom-in duration-800 opacity-10">✨</div>
    </div>
  );
};

export default GoalNarrator;
