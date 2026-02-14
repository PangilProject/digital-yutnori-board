import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import YutBoard from '@/components/YutBoard';
import GameResult from '@/components/board/GameResult';
import { useGameState } from '@/hooks/useGameState';
import { HelpModal } from '@/components/board/HelpModal';
import { TeamDashboard } from '@/components/board/TeamDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from '@/components/board/OnboardingTooltip';
import { useYutBoardLogic } from '@/hooks/useYutBoardLogic';

const GamePage = () => {
  const navigate = useNavigate();
  const { gameState, movePiece, nextTurn, resetGame, restartGame } = useGameState();
  const { currentStep, isVisible, completeStep, skipOnboarding } = useOnboarding();

  // 보드 로직을 페이지 레벨로 끌어올려 대시보드와 공유
  const boardLogic = useYutBoardLogic(
    gameState?.pieces || [], 
    gameState?.teams || [], 
    (pieceId, targetNodeId, isGoalMove) => {
      movePiece(pieceId, targetNodeId, isGoalMove);
      completeStep('game_move_piece');
      boardLogic.setters.setSelectedPieceId(null);
    },
    gameState?.currentTurn
  );

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

  const handleNextTurn = () => {
    nextTurn();
    completeStep('game_next_turn');
  };

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-10"
      style={{ background: 'linear-gradient(180deg, hsl(35, 45%, 94%) 0%, hsl(30, 35%, 88%) 100%)' }}>
      
      {/* Header */}
      <div className="max-w-[1600px] mx-auto flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter flex items-center gap-2">
            <span className="text-4xl">🎲</span> 윷놀이 디지털 말판
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <HelpModal />
          <Button variant="destructive" size="default" onClick={handleReset} className="font-bold px-6 shadow-lg shadow-destructive/20 border-2 border-destructive/10">
            🔄 게임 초기화
          </Button>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto">
        {/* Main Grid Layout: 2 Columns on PC/Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* Main Area: Yut Board */}
          <div className="relative flex-1 flex flex-col items-center order-1">
            <div className="relative w-full max-w-[1000px] bg-white/40 p-4 md:p-8 rounded-[3rem] shadow-inner-lg border-2 border-white/30 backdrop-blur-sm">
              <YutBoard
                pieces={gameState.pieces}
                teams={gameState.teams}
                onMovePiece={(pieceId, targetNodeId, isGoalMove) => {
                  movePiece(pieceId, targetNodeId, isGoalMove);
                  completeStep('game_move_piece');
                  boardLogic.setters.setSelectedPieceId(null);
                }}
                currentTurn={gameState.currentTurn}
                logic={boardLogic}
              />
              
              {/* Board Overlays / Tooltips */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1 h-1">
                <OnboardingTooltip 
                  isVisible={isVisible}
                  step={currentStep}
                  targetStep="game_start"
                  title="게임 시작!"
                  content="이제 본격적으로 게임을 시작합니다. 현재 턴인 팀의 말을 움직여보세요."
                  onNext={() => completeStep('game_start')}
                  onSkip={skipOnboarding}
                  position="top"
                />
              </div>

              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-1 h-1">
                <OnboardingTooltip 
                  isVisible={isVisible}
                  step={currentStep}
                  targetStep="game_move_piece"
                  title="말 선택 및 이동"
                  content="우측 팀 대시보드에서 '안 나온 말' 아이콘을 클릭해보세요. 보드판 하단에 나타난 이동 메뉴를 통해 게임을 시작할 수 있습니다."
                  onNext={() => completeStep('game_move_piece')}
                  onSkip={skipOnboarding}
                  position="top"
                />
              </div>
            </div>
            
            {/* Legend or subtle info */}
            <p className="mt-8 text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30">
              Traditional Strategy Digital Board • 윷놀이
            </p>
          </div>

          {/* Sidebar Area: All Team Dashboards */}
          <div className="flex flex-col gap-5 order-2">
            <div className="mb-2 px-2">
              <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Team Status
              </h2>
            </div>
            {gameState.teams.map(team => (
              <div key={team.id} className="relative">
                <TeamDashboard 
                  team={team}
                  pieces={gameState.pieces}
                  isCurrentTurn={gameState.currentTurn === team.id}
                  onNextTurn={gameState.currentTurn === team.id ? handleNextTurn : undefined}
                  onSelectPiece={(pieceId) => 
                    boardLogic.setters.setSelectedPieceId(prev => prev === pieceId ? null : pieceId)
                  }
                  selectedPieceId={boardLogic.states.selectedPieceId}
                  onMoveOption={(pieceId, steps) => {
                    const piece = gameState.pieces.find(p => p.id === pieceId);
                    if (piece) {
                      boardLogic.setters.setAnimatingPiece({
                        id: pieceId,
                        path: boardLogic.helpers.getMovementPath(piece.nodeId, steps),
                        currentIndex: 0
                      });
                    }
                    boardLogic.setters.setSelectedPieceId(null);
                  }}
                />
                <OnboardingTooltip 
                  isVisible={isVisible && gameState.currentTurn === team.id}
                  step={currentStep}
                  targetStep="game_next_turn"
                  title="턴 넘기기"
                  content="말을 모두 이동시켰다면 팀보드 하단 버튼을 눌러 상대 팀에게 기회를 넘겨주세요."
                  onNext={() => completeStep('game_next_turn')}
                  onSkip={skipOnboarding}
                  position="top"
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Result Overlay */}
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
