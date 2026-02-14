import React, { useEffect, useState } from 'react';
import { GameState, TeamId } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, Swords, Footprints, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

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
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ${show ? 'bg-black/60 backdrop-blur-md opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0'}`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all duration-700 transform ${show ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>
        {/* Header - Winner Banner */}
        <div 
          className="relative p-8 text-center text-white overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${winner.color} 0%, ${winner.color}cc 100%)` }}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[150%] bg-white rotate-12 blur-3xl" />
          </div>
          
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4 backdrop-blur-md animate-bounce">
            <Trophy size={48} className="text-yellow-300 drop-shadow-lg" />
          </div>
          
          <h2 className="text-4xl font-black mb-1 drop-shadow-md">VICTORY!</h2>
          <p className="text-xl font-bold opacity-90">{winner.emoji} {winner.name} 팀이 승리했습니다!</p>
        </div>

        {/* Content - Stats Summary */}
        <div className="p-6 md:p-8">
          <h3 className="text-lg font-bold text-muted-foreground mb-6 uppercase tracking-widest text-center">Match Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {gameState.teams.map(team => {
              const stats = gameState.stats?.[team.id];
              const isWinner = team.id === winner.id;
              
              return (
                <div 
                  key={team.id}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${isWinner ? 'bg-muted/30 border-primary/20' : 'bg-transparent border-dashed border-muted'}`}
                  style={{ borderColor: isWinner ? `${team.color}40` : undefined }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{team.emoji}</span>
                    <span className="font-bold text-sm" style={{ color: team.color }}>{team.name}</span>
                    {isWinner && <Trophy size={14} className="text-yellow-500 ml-auto" />}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <StatItem icon={<Footprints size={14} />} label="이동" value={stats?.moveCount || 0} color={team.color} />
                    <StatItem icon={<Swords size={14} />} label="잡기" value={stats?.captureCount || 0} color={team.color} />
                    <StatItem icon={<Layers size={14} />} label="업기" value={stats?.stackCount || 0} color={team.color} />
                    <StatItem icon={<Trophy size={14} />} label="완주" value={`${stats?.finishedCount || 0}/${team.pieceCount}`} color={team.color} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onRestart}
              className="flex-1 h-14 text-lg font-bold gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: winner.color }}
            >
              <RotateCcw size={20} />
              다시 하기
            </Button>
            <Button 
              variant="outline" 
              onClick={onHome}
              className="flex-1 h-14 text-lg font-bold gap-2 rounded-2xl border-2"
            >
              <Home size={20} />
              처음으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
  <div className="flex items-center gap-2">
    <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground font-bold leading-none mb-1">{label}</p>
      <p className="text-sm font-black leading-none" style={{ color }}>{value}</p>
    </div>
  </div>
);

export default GameResult;
