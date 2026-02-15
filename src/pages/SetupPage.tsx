import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeGame } from '@/hooks/useGameState';
import { TeamConfig, TeamId, TEAM_PRESETS, getRandomTeamName } from '@/types/game';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.png';

interface TeamSetup {
  name: string;
  pieceCount: number;
}

import { HelpModal } from '@/components/board/HelpModal';

import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from '@/components/board/OnboardingTooltip';

const SetupPage = () => {
  const navigate = useNavigate();
  const { currentStep, isVisible, completeStep, skipOnboarding } = useOnboarding();
  const [teamCount, setTeamCount] = useState(2);
  const [teamSetups, setTeamSetups] = useState<TeamSetup[]>([
    { name: '', pieceCount: 4 },
    { name: '', pieceCount: 4 },
    { name: '', pieceCount: 4 },
    { name: '', pieceCount: 4 },
  ]);

  const updateTeam = (index: number, field: keyof TeamSetup, value: string | number) => {
    setTeamSetups(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const handleStart = () => {
    const teams: TeamConfig[] = Array.from({ length: teamCount }, (_, i) => {
      const preset = TEAM_PRESETS[i];
      const setup = teamSetups[i];
      return {
        id: `team${i}` as TeamId,
        name: setup.name.trim() || getRandomTeamName(),
        pieceCount: setup.pieceCount,
        color: preset.color,
        colorLight: preset.colorLight,
        emoji: preset.emoji,
      };
    });
    completeStep('setup_team_config');
    initializeGame(teams);
    navigate('/game');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Background Image with Layered Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Yutnori Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-slate-950/40" />
      </div>

      <Card className="w-full max-w-lg shadow-2xl border border-white/10 relative z-10 bg-black/40 backdrop-blur-md text-white">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-white/50 hover:text-white hover:bg-white/10 flex items-center gap-1"
          >
            ← 홈으로
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <HelpModal />
        </div>
        <CardHeader className="text-center pb-4">
          <div className="text-5xl mb-2 drop-shadow-md">🎲</div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white">게임 설정</CardTitle>
          <p className="text-gray-400 mt-1">함께 즐길 팀과 규칙을 정해봅시다</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Team count selector */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="relative flex items-center gap-3">
              <Label className="text-sm font-semibold">팀 수:</Label>
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setTeamCount(n);
                    completeStep('setup_team_count');
                  }}
                  className={`w-10 h-10 rounded-full font-bold text-lg transition-all ${
                    teamCount === n
                      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
              <OnboardingTooltip 
                isVisible={isVisible}
                step={currentStep}
                targetStep="setup_team_count"
                title="팀 구성하기"
                content="먼저 함께 게임을 즐길 팀의 수를 선택해주세요. 2팀부터 최대 4팀까지 가능합니다."
                onNext={() => completeStep('setup_team_count')}
                onSkip={skipOnboarding}
                position="top"
              />
            </div>
          </div>

          {/* Team configs */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: teamCount }, (_, i) => {
              const preset = TEAM_PRESETS[i];
              return (
                <div
                  key={i}
                  className="p-3 rounded-xl border-2 transition-all flex flex-col justify-between"
                  style={{
                    borderColor: preset.color,
                    background: `linear-gradient(135deg, ${preset.colorLight}15, transparent)`,
                  }}
                >
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: preset.color }}>
                    <span className="text-lg">{preset.emoji}</span>
                    {preset.defaultName}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">팀 이름</Label>
                      <Input
                        value={teamSetups[i].name}
                        onChange={e => updateTeam(i, 'name', e.target.value)}
                        placeholder={`${preset.defaultName}`}
                        className="mt-0.5 h-8 text-sm bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-white/30"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        말 개수: <span className="font-bold text-white">{teamSetups[i].pieceCount}개</span>
                      </Label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={teamSetups[i].pieceCount}
                        onChange={e => updateTeam(i, 'pieceCount', Number(e.target.value))}
                        className="w-full mt-0.5 accent-current cursor-pointer"
                        style={{ accentColor: preset.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <OnboardingTooltip 
              isVisible={isVisible}
              step={currentStep}
              targetStep="setup_team_config"
              title="상세 설정"
              content="각 팀의 이름과 사용할 말의 개수(1~5개)를 자유롭게 설정할 수 있습니다."
              onNext={() => completeStep('setup_team_config')}
              onSkip={skipOnboarding}
              position="top"
            />
          </div>

          <Button onClick={handleStart} className="w-full text-lg h-12 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border-0" size="lg">
            🎮 게임 시작!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
