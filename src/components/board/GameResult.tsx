import React, { useEffect, useState } from 'react';
import { GameState, TeamId } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, Swords, Footprints, Layers } from 'lucide-react';
import * as confetti from 'canvas-confetti';

interface GameResultProps {
  gameState: GameState;
  onRestart: () => void;
  onHome: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ gameState, onRestart, onHome }) => {
  const winner = gameState.teams.find(t => t.id === gameState.winnerId);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    if (gameState.winnerId) {
      // 폭죽 효과 트리거
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [gameState.winnerId]);

  if (!winner) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ${show ? 'bg-black/40 backdrop-blur-md opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0'}`}>
      <div className={`bg-white rounded-[2rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] w-full max-w-2xl overflow-hidden transition-all duration-700 transform ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-12'}`}>
        {/* Header - Winner Banner */}
        <div className="relative px-8 pt-12 pb-10 text-center overflow-hidden">
          {/* Subtle light rays */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-40%] left-[-10%] w-[60%] h-[150%] bg-gradient-to-tr from-transparent via-slate-50 to-transparent rotate-[35deg] blur-2xl animate-pulse" />
          </div>
          
          <div className="relative inline-flex items-center justify-center w-28 h-28 bg-white rounded-full mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-50 animate-bounce" style={{ animationDuration: '4s' }}>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20`} style={{ backgroundColor: winner.color }} />
            <Trophy size={56} className="text-yellow-400 drop-shadow-sm" />
          </div>
          
          <div className="relative">
            <h2 className="text-6xl font-black mb-3 tracking-tighter text-slate-900">
              VICTORY!
            </h2>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full shadow-sm border border-slate-100 bg-white">
              <span className="text-2xl">{winner.emoji}</span>
              <p className="text-xl font-black uppercase tracking-widest" style={{ color: winner.color }}>
                {winner.name} 팀 승리!
              </p>
            </div>
          </div>
        </div>

        {/* Content - Stats Summary (Refined with Section Grouping) */}
        <div className="bg-slate-50/60 p-8 md:p-10 border-y border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-slate-200/60" />
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Match Stats</h3>
            <div className="h-[1px] flex-1 bg-slate-200/60" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gameState.teams.map(team => {
              const stats = gameState.stats?.[team.id];
              const isWinner = team.id === winner.id;
              
              return (
                <div 
                  key={team.id}
                  className={`relative p-6 rounded-[1.5rem] transition-all duration-500 bg-white border-2 ${isWinner ? 'border-slate-900/5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] scale-[1.02]' : 'border-transparent shadow-sm grayscale-[0.3] opacity-90'}`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-50/50 border border-slate-100">
                        {team.emoji}
                      </div>
                      <span className="font-black text-lg tracking-tight text-slate-800">{team.name}</span>
                    </div>
                    {isWinner && (
                      <div className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                        Winner
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <StatItem icon={<Footprints size={14} />} label="이동" value={stats?.moveCount || 0} color={team.color} active={isWinner} />
                    <StatItem icon={<Swords size={14} />} label="잡기" value={stats?.captureCount || 0} color={team.color} active={isWinner} />
                    <StatItem icon={<Layers size={14} />} label="업기" value={stats?.stackCount || 0} color={team.color} active={isWinner} />
                    <StatItem icon={<Trophy size={14} />} label="완주" value={`${stats?.finishedCount || 0}/${team.pieceCount}`} color={team.color} active={isWinner} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions - Footer Section */}
        <div className="p-8 md:px-10 md:py-8 bg-white">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onRestart}
              className="flex-[2] h-16 text-xl font-black gap-3 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-white"
              style={{ 
                background: winner.color,
                boxShadow: `0 12px 30px -8px ${winner.color}60`
              }}
            >
              <RotateCcw size={22} />
              다시 게임하기
            </Button>
            <Button 
              variant="outline" 
              onClick={onHome}
              className="flex-1 h-16 text-lg font-bold gap-2 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
            >
              <Home size={20} />
              메인으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, color, active }: { icon: React.ReactNode, label: string, value: string | number, color: string, active?: boolean }) => (
  <div className="flex items-center gap-3 group/stat">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-slate-50 text-slate-500' : 'bg-slate-50/50 text-slate-400'}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-tight">{label}</p>
      <p className="text-sm font-black leading-tight" style={{ color: active ? color : undefined }}>{value}</p>
    </div>
  </div>
);

export default GameResult;
