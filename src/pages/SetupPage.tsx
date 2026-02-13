import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeGame } from '@/hooks/useGameState';

const SetupPage = () => {
  const navigate = useNavigate();
  const [blueName, setBlueName] = useState('청팀');
  const [redName, setRedName] = useState('홍팀');
  const [blueCount, setBlueCount] = useState(4);
  const [redCount, setRedCount] = useState(4);

  const handleStart = () => {
    initializeGame(
      { name: blueName || '청팀', pieceCount: blueCount },
      { name: redName || '홍팀', pieceCount: redCount }
    );
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">🎲 윷놀이</CardTitle>
          <p className="text-muted-foreground mt-1">디지털 말판</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blue Team */}
          <div className="p-4 rounded-lg border-2" style={{ borderColor: 'hsl(220, 75%, 50%)' }}>
            <h3 className="font-bold text-lg mb-3" style={{ color: 'hsl(220, 75%, 50%)' }}>
              🔵 청팀
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="blue-name">팀 이름</Label>
                <Input
                  id="blue-name"
                  value={blueName}
                  onChange={e => setBlueName(e.target.value)}
                  placeholder="청팀"
                />
              </div>
              <div>
                <Label htmlFor="blue-count">말 개수 ({blueCount}개)</Label>
                <input
                  id="blue-count"
                  type="range"
                  min={1}
                  max={5}
                  value={blueCount}
                  onChange={e => setBlueCount(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>

          {/* Red Team */}
          <div className="p-4 rounded-lg border-2" style={{ borderColor: 'hsl(355, 75%, 50%)' }}>
            <h3 className="font-bold text-lg mb-3" style={{ color: 'hsl(355, 75%, 50%)' }}>
              🔴 홍팀
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="red-name">팀 이름</Label>
                <Input
                  id="red-name"
                  value={redName}
                  onChange={e => setRedName(e.target.value)}
                  placeholder="홍팀"
                />
              </div>
              <div>
                <Label htmlFor="red-count">말 개수 ({redCount}개)</Label>
                <input
                  id="red-count"
                  type="range"
                  min={1}
                  max={5}
                  value={redCount}
                  onChange={e => setRedCount(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleStart} className="w-full text-lg h-12" size="lg">
            🎮 게임 시작
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPage;
