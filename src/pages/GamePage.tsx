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
    <div className="min-h-screen p-2 md:p-4"
      style={{ background: 'linear-gradient(180deg, hsl(35, 45%, 90%) 0%, hsl(30, 35%, 85%) 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">🎲 윷놀이 말판</h1>
        <Button variant="destructive" size="sm" onClick={handleReset} className="font-semibold">
          🔄 초기화
        </Button>
      </div>

      {/* Team info bar */}
      <div className="flex flex-wrap gap-3 mb-3 px-2">
        {gameState.teams.map(team => (
          <div key={team.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold shadow-sm"
            style={{ background: `${team.color}18`, border: `2px solid ${team.color}` }}>
            <span className="w-3 h-3 rounded-full" style={{ background: team.color }} />
            <span style={{ color: team.color }}>{team.emoji} {team.name}</span>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex justify-center">
          <YutBoard
            pieces={gameState.pieces}
            teams={gameState.teams}
            onMovePiece={movePiece}
          />
        </div>

        <div className="lg:w-80 h-52 lg:h-[620px]">
          <GameLog logs={gameState.logs} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
