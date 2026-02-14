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

const GamePage = () => {
  const navigate = useNavigate();
  const { gameState, movePiece, nextTurn, resetGame, restartGame } = useGameState();
  const { currentStep, isVisible, completeStep, skipOnboarding } = useOnboarding();

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

  // 팀을 좌우로 나누기 (PC 레이아웃용)
  const leftTeams = gameState.teams.filter((_, i) => i % 2 === 0);
  const rightTeams = gameState.teams.filter((_, i) => i % 2 !== 0);

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

      <div className="max-w-[1600px] mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-8 items-start">
          
          {/* Left Side: Teams 0, 2 */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {leftTeams.map(team => (
              <div key={team.id} className="relative">
                <TeamDashboard 
                  team={team}
                  pieces={gameState.pieces}
                  isCurrentTurn={gameState.currentTurn === team.id}
                  onNextTurn={gameState.currentTurn === team.id ? handleNextTurn : undefined}
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

          {/* Center: Yut Board */}
          <div className="relative flex-1 flex flex-col items-center order-1 lg:order-2">
            <div className="relative w-full max-w-[650px] bg-white/50 p-4 md:p-8 rounded-[2rem] shadow-inner-lg border-2 border-white/20">
              <YutBoard
                pieces={gameState.pieces}
                teams={gameState.teams}
                onMovePiece={(pieceId, targetNodeId, isGoalMove) => {
                  movePiece(pieceId, targetNodeId, isGoalMove);
                  completeStep('game_move_piece');
                }}
                currentTurn={gameState.currentTurn}
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
                  title="말 이동 가이드"
                  content="하단 대기석의 말을 보드 위로 드래그하여 이동시켜보세요. 또는 말을 클릭하여 상세 메뉴를 열 수도 있습니다."
                  onNext={() => completeStep('game_move_piece')}
                  onSkip={skipOnboarding}
                  position="top"
                />
              </div>
            </div>
            
            {/* Legend or subtle info */}
            <p className="mt-6 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              Traditional Digital Experience • Digital Yutnori
            </p>
          </div>

          {/* Right Side: Teams 1, 3 */}
          <div className="flex flex-col gap-6 order-3">
            {rightTeams.map(team => (
              <div key={team.id} className="relative">
                <TeamDashboard 
                  team={team}
                  pieces={gameState.pieces}
                  isCurrentTurn={gameState.currentTurn === team.id}
                  onNextTurn={gameState.currentTurn === team.id ? handleNextTurn : undefined}
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
