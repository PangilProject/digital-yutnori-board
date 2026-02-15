import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.png';
import { MousePointer2, Zap, Layout, Trophy, Users, PlayCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <MousePointer2 className="w-6 h-6 text-blue-400" />,
      title: "직관적인 드래그 조작",
      description: "대시보드에서 보드판으로 말을 직접 끌어서 배치하세요. 실제 말판을 옮기는 듯한 손맛을 제공합니다."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "강렬한 시각 효과",
      description: "말을 잡거나 골인할 때 터지는 화려한 애니메이션과 내레이터가 게임의 박진감을 더해줍니다."
    },
    {
      icon: <Layout className="w-6 h-6 text-emerald-400" />,
      title: "자유로운 이동 모드",
      description: "복잡한 규칙 제한 없이, 실제 윷놀이판처럼 원하는 곳 어디든 말을 자유롭게 옮길 수 있습니다."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "팀 설정",
      content: "함께 즐길 팀 수(2~4팀)와 각 팀의 말 개수를 설정합니다."
    },
    {
      number: "02",
      title: "윷 던지기",
      content: "실제 윷을 던져 나온 결과를 확인합니다. (디지털 말판은 이동만 보조합니다)"
    },
    {
      number: "03",
      title: "말 이동",
      content: "나온 결과에 맞게 보드 위로 말을 드래그하거나 클릭하여 이동시킵니다."
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-slate-950 text-white scroll-smooth">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-20">
        {/* Background Image with Layered Overlays */}
        <div 
          className={cn(
            "absolute inset-0 z-0 transition-transform duration-[3000ms] ease-out scale-110",
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
                className="group relative h-14 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-white/90 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                게임 시작하기
              </Button>
              
              <button 
                className="h-14 px-8 text-white/70 hover:text-white font-semibold transition-colors flex items-center gap-2"
                onClick={() => {
                  const featuresEl = document.getElementById('features');
                  featuresEl?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                더 알아보기
                <span className="animate-bounce mt-1">↓</span>
              </button>
            </div>
          </div>
        </main>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full max-w-6xl px-6 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Play Section */}
      <section className="relative z-10 w-full max-w-6xl px-6 py-32 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How to Play</h2>
          <p className="text-gray-400">간단한 3단계를 통해 디지털 윷놀이를 즐겨보세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10" />
          
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="text-6xl font-black text-white/5 mb-[-1.5rem] select-none tracking-tighter">
                {step.number}
              </div>
              <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-blue-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
                {step.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/setup')} 
            className="rounded-xl border-white/10 hover:bg-white/10 hover:text-white px-8 h-12 font-bold"
          >
            지금 체험해보기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-20 border-t border-white/5 flex flex-col items-center">
        <div className="text-[10px] font-bold text-white/30 tracking-[1em] uppercase mb-8">
          Digital Yutnori Project
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Tradition meets technology. Created with Passion.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
