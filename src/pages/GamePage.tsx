import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import YutBoard from '@/components/YutBoard';
import GameLog from '@/components/GameLog';
import { useGameState } from '@/hooks/useGameState';

const GamePage = () => {
  const navigate = useNavigate();
  const { gameState, movePiece, resetGame } = useGameState();

  useEffect(() => {
    if (!gameState) navigate('/', { replace: true });
  }, [gameState, navigate]);

  if (!gameState) return null;

  const handleReset = () => {
    resetGame();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">🎲 윷놀이 말판</h1>
        <Button variant="destructive" size="sm" onClick={handleReset}>
          🔄 초기화
        </Button>
      </div>

      {/* Team info bar */}
      <div className="flex gap-4 mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full inline-block" style={{ background: 'hsl(220, 75%, 50%)' }} />
          <span className="font-semibold text-sm text-foreground">{gameState.blueTeam.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full inline-block" style={{ background: 'hsl(355, 75%, 50%)' }} />
          <span className="font-semibold text-sm text-foreground">{gameState.redTeam.name}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Board */}
        <div className="flex-1 flex justify-center">
          <YutBoard
            pieces={gameState.pieces}
            blueTeamName={gameState.blueTeam.name}
            redTeamName={gameState.redTeam.name}
            onMovePiece={movePiece}
          />
        </div>

        {/* Log sidebar */}
        <div className="lg:w-72 h-48 lg:h-[600px]">
          <GameLog logs={gameState.logs} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
