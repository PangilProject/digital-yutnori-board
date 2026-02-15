import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CaptureNarratorProps {
  capturingTeam: string;
  capturedTeam: string;
  count: number;
  id: string;
}

/**
 * 상대방의 말을 잡았을 때 화면 중앙에 강렬한 임팩트를 주는 애니메이션 오버레이입니다.
 */
const CaptureNarrator: React.FC<CaptureNarratorProps> = ({ capturingTeam, capturedTeam, count, id }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000); // 2초간 노출
    return () => clearTimeout(timer);
  }, [id]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* 배경 섬광 효과 */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] animate-in fade-in duration-300" />
      
      {/* 중앙 임팩트 박스 */}
      <div className="relative flex flex-col items-center justify-center scale-150 md:scale-[2.5] animate-in zoom-in-50 slide-in-from-bottom-10 duration-500 ease-out">
        
        {/* 뒤쪽 후광 애니메이션 */}
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
        
        {/* 장식용 선 */}
        <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-primary to-transparent mb-4 opacity-50" />
        
        <div className="relative bg-white/90 dark:bg-slate-900/90 px-8 py-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.2)] border-4 border-primary/30 flex flex-col items-center gap-1">
          <span className="text-4xl animate-bounce mb-2">💥</span>
          
          <h2 className="text-3xl font-[1000] tracking-tighter uppercase italic text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            CAPTURED!
          </h2>
          
          <div className="flex flex-col items-center mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
              Amazing Move
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 whitespace-nowrap mt-1">
              <span className="text-primary underline decoration-2 underline-offset-4">{capturingTeam}</span> 팀이 
              <span className="text-rose-500 mx-1">{capturedTeam}</span>의 말 
              <span className="bg-primary text-white px-2 py-0.5 rounded-lg mx-1 inline-block transform -rotate-3">{count}개</span>를 잡았습니다!
            </p>
          </div>
        </div>

        {/* 장식용 선 */}
        <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-primary to-transparent mt-4 opacity-50" />
      </div>

      {/* 주변 파티클 애니메이션 (Emoji 화염) */}
      <div className="absolute top-1/4 left-1/4 text-4xl animate-in zoom-in slide-in-from-top-20 duration-700 opacity-20">🔥</div>
      <div className="absolute bottom-1/4 right-1/4 text-4xl animate-in zoom-in slide-in-from-bottom-20 duration-700 opacity-20 delay-100">💥</div>
      <div className="absolute top-1/3 right-1/5 text-4xl animate-in zoom-in slide-in-from-right-20 duration-700 opacity-20 delay-200">🔥</div>
    </div>
  );
};

export default CaptureNarrator;
