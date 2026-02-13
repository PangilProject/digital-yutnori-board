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

const SetupPage = () => {
  const navigate = useNavigate();
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
    initializeGame(teams);
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, hsl(35, 45%, 88%) 0%, hsl(25, 40%, 82%) 50%, hsl(35, 35%, 85%) 100%)' }}>
      <Card className="w-full max-w-lg shadow-2xl border-2 border-border">
        <CardHeader className="text-center pb-4">
          <div className="text-5xl mb-2">🎲</div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">윷놀이</CardTitle>
          <p className="text-muted-foreground mt-1">디지털 말판 · 자유 이동 모드</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Team count selector */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <Label className="text-sm font-semibold">팀 수:</Label>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setTeamCount(n)}
                className={`w-10 h-10 rounded-full font-bold text-lg transition-all ${
                  teamCount === n
                    ? 'bg-foreground text-background shadow-lg scale-110'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Team configs */}
          {Array.from({ length: teamCount }, (_, i) => {
            const preset = TEAM_PRESETS[i];
            return (
              <div
                key={i}
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: preset.color,
                  background: `linear-gradient(135deg, ${preset.colorLight}15, transparent)`,
                }}
              >
                <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: preset.color }}>
                  <span className="text-xl">{preset.emoji}</span>
                  {preset.defaultName}
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">팀 이름 (비우면 랜덤)</Label>
                    <Input
                      value={teamSetups[i].name}
                      onChange={e => updateTeam(i, 'name', e.target.value)}
                      placeholder={`예: ${preset.defaultName}`}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      말 개수: <span className="font-bold text-foreground">{teamSetups[i].pieceCount}개</span>
                    </Label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={teamSetups[i].pieceCount}
                      onChange={e => updateTeam(i, 'pieceCount', Number(e.target.value))}
                      className="w-full mt-1 accent-current"
                      style={{ accentColor: preset.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <Button onClick={handleStart} className="w-full text-lg h-12 font-bold" size="lg">
            🎮 게임 시작!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
