import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image with Layered Overlays */}
      <div 
        className={cn(
          "absolute inset-0 z-0 transition-transform duration-[3000ms] ease-out-expo scale-110",
          mounted ? "scale-100" : "scale-125"
        )}
      >
        <img 
          src={heroBg} 
          alt="Yutnori Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950/40" />
      </div>

      {/* Floating Particles or Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full animate-pulse delay-700" />

      {/* Content Area */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        <div 
          className={cn(
            "transition-all duration-1000 delay-300 transform",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-6 inline-block backdrop-blur-md">
            The Digital Heritage
          </span>
          
          <h1 className="text-6xl md:text-8xl font-[1000] tracking-tighter text-white mb-6 drop-shadow-2xl">
            디지털 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-amber-400">윷놀이</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 font-medium">
            전통의 즐거움과 현대적 감각의 만남. <br className="hidden md:block" />
            자유로운 말의 이동과 강력한 이팩트로 재해석된 새로운 윷놀이를 경험하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/setup')}
              className="group relative h-14 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-white/90 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                게임 시작하기
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Button>
            
            <button 
              className="h-14 px-8 text-white/70 hover:text-white font-semibold transition-colors flex items-center gap-2"
              onClick={() => {
                const gameInfo = document.getElementById('features');
                gameInfo?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              더 알아보기
            </button>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center opacity-30">
        <div className="flex items-center gap-8 text-[10px] font-bold text-white tracking-[0.5em] uppercase">
          <span>Tradition</span>
          <div className="w-1 h-1 bg-white rounded-full" />
          <span>Digital</span>
          <div className="w-1 h-1 bg-white rounded-full" />
          <span>Magic</span>
        </div>
      </div>
      
      {/* Decorative Lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent z-0" />
    </div>
  );
};

export default LandingPage;
