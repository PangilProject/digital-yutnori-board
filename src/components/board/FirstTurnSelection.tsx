import { TeamConfig, TeamId } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
interface FirstTurnSelectionProps {
  teams: TeamConfig[];
  onSelect: (teamId: TeamId) => void;
}

export const FirstTurnSelection = ({ teams, onSelect }: FirstTurnSelectionProps) => {
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * teams.length);
    onSelect(teams[randomIndex].id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="text-6xl mb-4 animate-bounce">🎲</div>
          <CardTitle className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            누구부터 시작할까요?
          </CardTitle>
          <p className="text-slate-400 text-lg">먼저 말을 던질 팀을 선택해주세요</p>
        </CardHeader>
        <CardContent className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => onSelect(team.id)}
                  className="w-full h-full min-h-[160px] flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all hover:bg-white/5 group relative overflow-hidden"
                  style={{ 
                    borderColor: team.color,
                    backgroundColor: `${team.color}10`
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${team.color}, transparent 70%)` }}
                  />
                  <span className="text-5xl mb-4 filter drop-shadow-lg">{team.emoji}</span>
                  <span className="text-xl font-bold text-white group-hover:scale-110 transition-transform">
                    {team.name}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider mt-2 opacity-60" style={{ color: team.colorLight }}>
                    Select Team
                  </span>
                </button>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleRandom}
              size="lg"
              className="px-8 h-14 text-lg font-bold bg-white text-slate-900 hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-full gap-2"
            >
              <span className="text-2xl">⚡️</span>
              랜덤으로 선택하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
