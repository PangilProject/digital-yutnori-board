import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeGame } from '@/hooks/useGameState';
import { TeamConfig, TeamId, TEAM_PRESETS, getRandomTeamName } from '@/types/game';

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
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, hsl(35, 45%, 88%) 0%, hsl(25, 40%, 82%) 50%, hsl(35, 35%, 85%) 100%)' }}>
      <Card className="w-full max-w-lg shadow-2xl border-2 border-border relative">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            ← 홈으로
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <HelpModal />
        </div>
        <CardHeader className="text-center pb-4">
          <div className="text-5xl mb-2">🎲</div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">게임 설정</CardTitle>
          <p className="text-muted-foreground mt-1">함께 즐길 팀과 규칙을 정해봅시다</p>
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
                      ? 'bg-foreground text-background shadow-lg scale-110'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
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
                        className="mt-0.5 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        말 개수: <span className="font-bold text-foreground">{teamSetups[i].pieceCount}개</span>
                      </Label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={teamSetups[i].pieceCount}
                        onChange={e => updateTeam(i, 'pieceCount', Number(e.target.value))}
                        className="w-full mt-0.5 accent-current"
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

          <Button onClick={handleStart} className="w-full text-lg h-12 font-bold" size="lg">
            🎮 게임 시작!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
