import { useState } from 'react';
import { TeamConfig, TeamId } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Check } from 'lucide-react';

interface FirstTurnSelectionProps {
  teams: TeamConfig[];
  onOrderComplete: (orderedTeamIds: TeamId[]) => void;
}

export const FirstTurnSelection = ({ teams, onOrderComplete }: FirstTurnSelectionProps) => {
  const [selectedOrder, setSelectedOrder] = useState<TeamId[]>([]);

  const handleSelect = (teamId: TeamId) => {
    if (selectedOrder.includes(teamId)) return;
    
    const newOrder = [...selectedOrder, teamId];
    setSelectedOrder(newOrder);

    // 모든 팀이 선택되었으면 자동으로 완료 (선택적) 또는 사용자가 확인 버튼 누르게 하기
    // 여기서는 UX상 마지막 팀 선택 시 잠시 보여주고 완료 처리하거나 바로 넘어가는게 좋을 듯
    if (newOrder.length === teams.length) {
      setTimeout(() => onOrderComplete(newOrder), 500);
    }
  };

  const handleReset = () => {
    setSelectedOrder([]);
  };

  const handleRandom = () => {
    const shuffled = [...teams]
      .map(t => t.id)
      .sort(() => Math.random() - 0.5);
    setSelectedOrder(shuffled);
    setTimeout(() => onOrderComplete(shuffled), 800);
  };

  const getSelectionIndex = (teamId: TeamId) => {
    return selectedOrder.indexOf(teamId);
  };

  const isSelected = (teamId: TeamId) => selectedOrder.includes(teamId);
  const currentStep = selectedOrder.length + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-5xl bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-6 border-b border-white/5 bg-white/5">
          <div className="text-6xl mb-4 animate-bounce">🎲</div>
          <CardTitle className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            게임 순서 정하기
          </CardTitle>
          <p className="text-slate-400 text-lg">
            {selectedOrder.length === teams.length ? (
              <span className="text-green-400 font-bold">순서가 결정되었습니다! 잠시 후 게임이 시작됩니다.</span>
            ) : (
              <span>
                <span className="text-yellow-400 font-bold text-xl mr-2">{currentStep}번째</span>
                순서로 진행할 팀을 선택해주세요
              </span>
            )}
          </p>
        </CardHeader>
        
        <CardContent className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {teams.map((team) => {
              const selectedIdx = getSelectionIndex(team.id);
              const isPicked = selectedIdx >= 0;
              const rank = selectedIdx + 1;

              return (
                <motion.div
                  key={team.id}
                  whileHover={!isPicked ? { scale: 1.05 } : {}}
                  whileTap={!isPicked ? { scale: 0.95 } : {}}
                  className={`relative ${isPicked ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <button
                    onClick={() => handleSelect(team.id)}
                    disabled={isPicked}
                    className={`w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 rounded-3xl border-4 transition-all relative overflow-hidden group
                      ${isPicked 
                        ? 'bg-slate-900 border-white/20 opacity-100 scale-100' 
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                      }`}
                    style={isPicked ? { borderColor: team.color } : {}}
                  >
                    {/* Background Glow */}
                    <div 
                      className={`absolute inset-0 transition-opacity duration-500 ${isPicked ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`}
                      style={{ background: `radial-gradient(circle at center, ${team.color}, transparent 70%)` }}
                    />

                    {/* Rank Badge */}
                    <AnimatePresence>
                      {isPicked && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shadow-lg z-10 text-white border-2 border-white/20"
                          style={{ backgroundColor: team.color }}
                        >
                          {rank}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Emoji */}
                    <span className={`text-6xl mb-6 filter drop-shadow-lg transition-transform duration-300 ${isPicked ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {team.emoji}
                    </span>

                    {/* Team Name */}
                    <span className="text-2xl font-black text-white mb-2">
                      {team.name}
                    </span>

                    {/* Status Text */}
                    <span className="text-sm font-bold uppercase tracking-wider" style={{ color: isPicked ? team.color : '#94a3b8' }}>
                      {isPicked ? `${rank}번 타자` : '선택하기'}
                    </span>

                    {/* Checkmark Overlay for selected */}
                    {isPicked && (
                      <div className="absolute top-4 right-4 text-white/20">
                        <Check size={32} />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleRandom}
              size="lg"
              variant="outline"
              className="px-8 h-14 text-lg font-bold border-2 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl"
              disabled={selectedOrder.length > 0}
            >
              <span className="mr-2 text-xl">⚡️</span>
              랜덤 순서
            </Button>
            
            {selectedOrder.length > 0 && selectedOrder.length < teams.length && (
              <Button 
                onClick={handleReset}
                size="lg"
                variant="destructive"
                className="px-8 h-14 text-lg font-bold rounded-2xl bg-red-500/10 text-red-400 border-2 border-red-500/20 hover:bg-red-500/20"
              >
                <RefreshCcw className="mr-2 h-5 w-5" />
                초기화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
