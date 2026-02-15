import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import YutBoard from '@/components/YutBoard';
import GameResult from '@/components/board/GameResult';
import { useGameState } from '@/hooks/useGameState';
import { HelpModal } from '@/components/board/HelpModal';
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TeamDashboard } from '@/components/board/TeamDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingTooltip } from '@/components/board/OnboardingTooltip';
import { useYutBoardLogic } from '@/hooks/useYutBoardLogic';
import CaptureNarrator from '@/components/board/CaptureNarrator';
import GoalNarrator from '@/components/board/GoalNarrator';
import { GameTimer } from '@/components/board/GameTimer';
import { FirstTurnSelection } from '@/components/board/FirstTurnSelection';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.png';
import { RefreshCcw } from 'lucide-react';

const GamePage = () => {
  const navigate = useNavigate();
  const { gameState, movePiece, nextTurn, resetGame, restartGame, setTeamOrder } = useGameState();
  const { currentStep, isVisible, completeStep, skipOnboarding } = useOnboarding();
  const svgRef = useRef<SVGSVGElement>(null);

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

  const { setters, helpers } = boardLogic;

  // 대시보드에서 보드판으로 직접 드래그하는 로직
  const handleDashboardDragStart = useCallback((pieceId: string, e: React.PointerEvent) => {
    if (!svgRef.current) return;
    
    // 1. 초기 SVG 좌표 계산 및 드래그 상태 시작
    const pos = helpers.clientToSVG(e.clientX, e.clientY, svgRef.current);
    setters.setDrag({ pieceId, currentX: pos.x, currentY: pos.y });
    setters.setSelectedPieceId(null);

    // 2. 글로벌 마우스 이동 핸들러
    const handleGlobalMove = (moveEvent: PointerEvent) => {
      if (!svgRef.current) return;
      const movePos = helpers.clientToSVG(moveEvent.clientX, moveEvent.clientY, svgRef.current);
      setters.setDrag(prev => prev ? { ...prev, currentX: movePos.x, currentY: movePos.y } : null);
    };

    // 3. 글로벌 마우스 업 핸들러 (이동 완료)
    const handleGlobalUp = (upEvent: PointerEvent) => {
      if (!svgRef.current) return;
      const upPos = helpers.clientToSVG(upEvent.clientX, upEvent.clientY, svgRef.current);
      const piece = gameState?.pieces.find(p => p.id === pieceId);
      const nearest = helpers.findNearestNode(upPos.x, upPos.y);

      if (nearest) {
        if (piece?.nodeId === null && nearest.id === 'n0') {
          // 대기실에서 출발 지점으로 바로 놓았을 때
          movePiece(pieceId, null);
        } else {
          // 일반 노드 위치에 놓았을 때
          movePiece(pieceId, nearest.id);
        }
      }
      
      setters.setDrag(null);
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
    };

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
  }, [helpers, setters, gameState?.pieces, movePiece]);

  useEffect(() => {
    if (!gameState) navigate('/', { replace: true });
  }, [gameState, navigate]);

  if (!gameState) return null;

  const handleReset = () => {
    resetGame();
    navigate('/setup', { replace: true });
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Background Image with Layered Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Yutnori Background" 
          className="w-full h-full object-cover opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/0 to-slate-950/40" />
      </div>

      <div className="relative z-10 p-2 md:p-4 lg:p-6">
      
      {/* Header */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 px-2 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-md hidden md:block">🎲</span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white/90 drop-shadow-sm whitespace-nowrap">
              윷놀이 디지털 말판
            </h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <GameTimer startTime={gameState.startTime} />
            <HelpModal />
            <ConfirmModal
              title="게임 재시작"
              description="현재 설정 그대로 게임을 처음부터 다시 시작합니다. 진행 상황이 초기화됩니다. 계속하시겠습니까?"
              confirmText="재시작"
              cancelText="취소"
              onConfirm={handleRestart}
              variant="default" // 파괴적이지 않으므로 기본 스타일 사용
              trigger={
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="gap-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all text-xs h-10 px-3 md:px-4 rounded-full font-bold backdrop-blur-sm"
                >
                  <RefreshCcw size={14} className="rotate-180" /> 
                  <span className="hidden sm:inline">게임 재시작</span>
                  <span className="sm:hidden">재시작</span>
                </Button>
              }
            />
            <ConfirmModal
              title="게임 종료"
              description="현재 진행 중인 게임 내용이 모두 사라집니다. 정말 종료하시겠습니까?"
              confirmText="종료"
              cancelText="취소"
              onConfirm={handleReset}
              variant="destructive"
              trigger={
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="gap-2 bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/20 border border-white/5 transition-all text-xs h-10 px-3 md:px-4 rounded-full font-bold backdrop-blur-sm"
                >
                  <RefreshCcw size={14} /> 
                  <span className="hidden sm:inline">게임 종료</span>
                  <span className="sm:hidden">종료</span>
                </Button>
              }
            />
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* Main Grid Layout: 2 Columns on PC/Tablet. Adjusted sidebar width for multi-column dashboards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_560px] 2xl:grid-cols-[1fr_760px] gap-4 lg:gap-8 items-center h-full">
          
          {/* Main Area: Yut Board */}
          <div className="relative flex-1 flex flex-col items-center justify-center order-1 w-full h-full overflow-hidden">
            <div className="relative w-full max-w-[500px] lg:max-w-[650px] bg-white/5 p-4 md:p-6 lg:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md shrink-0">
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
                svgRef={svgRef}
              />
              
              {/* Board Overlays / Tooltips */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1">
                <OnboardingTooltip 
                  isVisible={isVisible}
                  step={currentStep}
                  targetStep="game_start"
                  title="게임 시작!"
                  content="이제 본격적으로 게임을 시작합니다. 우측 대시보드에서 말을 선택하여 보드판으로 진출시켜보세요."
                  onNext={() => completeStep('game_start')}
                  onSkip={skipOnboarding}
                  position="top"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Area: All Team Dashboards */}
          {/* Mobile/Tablet Portrait: Grid 1 or 2 cols (already set). Desktop Sidebar: Grid 1 or 2 cols depending on team count */}
          <div 
            className={cn(
              "grid gap-3 md:gap-4 order-2 w-full max-h-full overflow-y-auto pr-2 custom-scrollbar content-start",
              // Mobile/Tablet
              "grid-cols-1 md:grid-cols-2",
              // Desktop Sidebar - Conditional Grid
              gameState.teams.length >= 3 ? "lg:grid-cols-2" : "lg:grid-cols-1"
            )}
          >
            <div className={cn(
              "mb-0 px-2 lg:mb-2 shrink-0",
              // Span 2 columns if in grid mode and we want header to be full width? 
              // Or just let it take one slot? Let's make it full width if 2 cols.
              gameState.teams.length >= 3 ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1 md:col-span-2 lg:col-span-1"
            )}>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
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
                  onDragStart={handleDashboardDragStart}
                />
                
                {/* Move Piece Tooltip - Points to the Dashboard */}
                <div className="absolute top-1/2 right-[calc(100%+20px)] w-0 h-0">
                  <OnboardingTooltip 
                    isVisible={isVisible && gameState.currentTurn === team.id}
                    step={currentStep}
                    targetStep="game_move_piece"
                    title="말 선택 및 이동"
                    content="'안 나온 말' 아이콘을 클릭하여 이동 메뉴를 열어보세요. 대시보드에서 바로 조작할 수 있습니다."
                    onNext={() => completeStep('game_move_piece')}
                    onSkip={skipOnboarding}
                    position="left"
                  />
                </div>

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

      {/* Footer Legend */}
      <div className="mt-12 mb-6 text-center pb-8">
        <p className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] opacity-50">
          Traditional Strategy Digital Board • 윷놀이
        </p>
      </div>

      {gameState.status === 'first_turn' && (
        <FirstTurnSelection 
          teams={gameState.teams}
          onOrderComplete={setTeamOrder} // Note: setFirstTurn is effectively setTeamOrder now, but I renamed it in the hook. I need to make sure I use the destuctured name correctly.
        />
      )}

      {/* Capture Overlay */}
      {gameState.lastCapture && (
        <CaptureNarrator 
          {...gameState.lastCapture}
        />
      )}

      {/* Goal Overlay */}
      {gameState.lastGoal && (
        <GoalNarrator 
          {...gameState.lastGoal}
        />
      )}

      {/* Result Overlay */}
      {gameState.winnerId && (
        <GameResult 
          gameState={gameState} 
          onRestart={handleRestart} 
          onHome={handleHome} 
        />
      )}
      </div>
    </div>
  );
};

export default GamePage;
