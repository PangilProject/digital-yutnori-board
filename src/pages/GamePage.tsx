import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import YutBoard from '@/components/YutBoard';
import GameLog from '@/components/GameLog';
import GameResult from '@/components/board/GameResult';
import { useGameState } from '@/hooks/useGameState';

const GamePage = () => {
  const navigate = useNavigate();
  const { gameState, movePiece, nextTurn, resetGame, restartGame } = useGameState();

  useEffect(() => {
    if (!gameState) navigate('/', { replace: true });
  }, [gameState, navigate]);

  if (!gameState) return null;

  const handleReset = () => {
    resetGame();
    navigate('/', { replace: true });
  };

  const handleRestart = () => {
    restartGame();
  };

  const handleHome = () => {
    resetGame();
    navigate('/', { replace: true });
  };

  const getFinishedCount = (teamId: string) => {
    return gameState.pieces.filter(p => p.team === teamId && p.isFinished).length;
  };

  const getTotalPieces = (teamId: string) => {
    return gameState.teams.find(t => t.id === teamId)?.pieceCount || 0;
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

      {/* Team info bar - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 px-2">
        {gameState.teams.map(team => {
          const isCurrentTurn = gameState.currentTurn === team.id;
          const finished = getFinishedCount(team.id);
          const total = getTotalPieces(team.id);
          
          return (
            <div 
              key={team.id} 
              className={`relative flex flex-col gap-1 p-3 rounded-xl transition-all duration-300 ${isCurrentTurn ? 'ring-4 ring-offset-2 scale-105 z-10' : 'opacity-80'}`}
              style={{ 
                background: `white`, 
                border: `3px solid ${team.color}`,
                borderColor: isCurrentTurn ? team.color : `${team.color}40`,
                boxShadow: isCurrentTurn ? `0 0 20px ${team.color}40` : 'none'
              }}
            >
              {isCurrentTurn && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Current Turn
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold truncate">
                  <span className="text-lg">{team.emoji}</span>
                  <span style={{ color: team.color }} className="truncate">{team.name}</span>
                </div>
                <div className="text-xs font-bold px-2 py-1 rounded-md bg-muted">
                  {finished}/{total}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${(finished / total) * 100}%`,
                    backgroundColor: team.color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Turn Control */}
      <div className="flex justify-center mb-4 px-2">
        <Button 
          size="lg" 
          onClick={() => nextTurn()} 
          className="w-full md:w-auto md:min-w-[300px] h-14 text-lg font-black shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          style={{
            background: gameState.teams.find(t => t.id === gameState.currentTurn)?.color || 'black',
            boxShadow: `0 8px 30px ${gameState.teams.find(t => t.id === gameState.currentTurn)?.color}60`
          }}
        >
          ⏭️ {gameState.teams.find(t => t.id === gameState.currentTurn)?.name} 턴 넘기기
        </Button>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex justify-center">
          <YutBoard
            pieces={gameState.pieces}
            teams={gameState.teams}
            onMovePiece={movePiece}
            currentTurn={gameState.currentTurn}
          />
        </div>

        <div className="lg:w-80 h-52 lg:h-[620px]">
          <GameLog logs={gameState.logs} />
        </div>
      </div>

      {/* 결과 화면 오버레이 */}
      {gameState.winnerId && (
        <GameResult 
          gameState={gameState} 
          onRestart={handleRestart} 
          onHome={handleHome} 
        />
      )}
    </div>
  );
};

export default GamePage;
