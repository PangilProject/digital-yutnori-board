import { useState, useCallback, useEffect } from 'react';
import { GameState, Piece, TeamConfig, TeamId, TeamStats } from '@/types/game';
import { getNodeById } from '@/data/boardNodes';
import { trackEvent } from '@/lib/analytics';

const STORAGE_KEY = 'yutnori-game-state';

function loadState(): GameState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state: GameState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function createInitialPieces(teams: TeamConfig[]): Piece[] {
  const pieces: Piece[] = [];
  teams.forEach(team => {
    for (let i = 0; i < team.pieceCount; i++) {
      pieces.push({ id: `${team.id}-${i}`, team: team.id, nodeId: null });
    }
  });
  return pieces;
}

export function initializeGame(teams: TeamConfig[]): GameState {
  const teamNames = teams.map(t => t.name).join(' vs ');
  
  // 초기 통계 데이터 생성
  const stats: Partial<Record<TeamId, TeamStats>> = {};
  teams.forEach(t => {
    stats[t.id] = { moveCount: 0, captureCount: 0, stackCount: 0, finishedCount: 0 };
  });

  const state: GameState = {
    teams,
    pieces: createInitialPieces(teams),
    logs: [`🎮 게임 시작! ${teamNames}`, `🎲 먼저 시작할 팀을 선택해주세요.`],
    currentTurn: teams[0].id,
    stats: stats as Record<TeamId, TeamStats>,
    winnerId: null,
    status: 'first_turn',
    startTime: undefined
  };
  saveState(state);
  
  trackEvent({
    category: 'Game',
    action: 'game_start',
    value: teams.length,
    team_names: teamNames
  });

  return state;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(() => loadState());

  useEffect(() => {
    if (gameState) saveState(gameState);
  }, [gameState]);

  const getTeam = useCallback((teamId: TeamId, state: GameState): TeamConfig | undefined => {
    return state.teams.find(t => t.id === teamId);
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.winnerId) return prev;
      const currentIndex = prev.teams.findIndex(t => t.id === prev.currentTurn);
      const nextIndex = (currentIndex + 1) % prev.teams.length;
      const nextTeam = prev.teams[nextIndex];
      return {
        ...prev,
        currentTurn: nextTeam.id,
        logs: [...prev.logs, `👋 ${nextTeam.emoji} ${nextTeam.name}의 차례입니다.`],
      };
    });
  }, []);

  const movePiece = useCallback((pieceId: string, targetNodeId: string | null, isGoalMove: boolean = false) => {
    setGameState(prev => {
      if (!prev || prev.winnerId) return prev;
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece) return prev;
      
      // Block moves if it's not the team's turn
      if (piece.team !== prev.currentTurn) {
        return {
          ...prev,
          logs: [...prev.logs, `⚠️ 현재는 ${prev.teams.find(t => t.id === prev.currentTurn)?.name}의 차례입니다!`],
        };
      }

      // Identify all pieces in the stack (same team, same node)
      const stackPieces = piece.nodeId === null 
        ? [piece]
        : prev.pieces.filter(p => 
            p.team === piece.team && 
            p.nodeId === piece.nodeId && 
            !p.isFinished
          );
      const stackIds = stackPieces.map(p => p.id);
      const stackCount = stackPieces.length;

      const team = getTeam(piece.team, prev);
      const pieceNum = stackCount > 1 
        ? `${stackCount}개의 말` 
        : `${parseInt(stackIds[0].split('-')[1]) + 1}번 말`;
      
      let targetLabel = '';
      if (isGoalMove) targetLabel = '🏁 골인!';
      else targetLabel = targetNodeId ? (getNodeById(targetNodeId)?.label || targetNodeId) : '대기석';

      const logs = [...prev.logs];
      logs.push(`${team?.emoji || ''} ${team?.name || piece.team} ${pieceNum} → ${targetLabel}`);

      trackEvent({
        category: 'Game',
        action: 'piece_move',
        label: team?.name,
        team_id: piece.team,
        from_node: piece.nodeId || 'home',
        to_node: isGoalMove ? 'goal' : (targetNodeId || 'home'),
        is_goal: isGoalMove ? 1 : 0
      });

      // 통계 업데이트를 위한 복사본
      const nextStats = { ...prev.stats };
      const teamStats = { ...nextStats[piece.team] };

      // 이동 횟수 증가 (실제로 이동했거나 골인한 경우만)
      const isActuallyMoving = isGoalMove || targetNodeId !== piece.nodeId;
      if (isActuallyMoving) {
        teamStats.moveCount += 1;
      }
      
      // 업기 발생 통계 (기존에 없던 말이 합쳐진 경우)
      if (targetNodeId && !isGoalMove) {
        const existingPieces = prev.pieces.filter(p => 
          p.nodeId === targetNodeId && 
          p.team === piece.team && 
          !p.isFinished &&
          !stackIds.includes(p.id)
        );
        if (existingPieces.length > 0) {
          teamStats.stackCount += 1;
          trackEvent({
            category: 'Game',
            action: 'piece_stack',
            label: team?.name,
            team_id: piece.team,
            stack_count: stackCount + existingPieces.length
          });
        }
      }

      let updatedPieces = [...prev.pieces];

      if (isGoalMove) {
        // 골인 처리
        updatedPieces = updatedPieces.map(p =>
          stackIds.includes(p.id) ? { ...p, nodeId: null, isFinished: true } : p
        );
        teamStats.finishedCount += stackCount;

        // 골인 내레이터 트리거
        const teamName = team?.name || piece.team;
        setGameState(s => s ? {
          ...s,
          lastGoal: {
            teamName,
            count: stackCount,
            id: `goal-${Date.now()}-${pieceId}`
          }
        } : s);
      } else {
        // 일반 이동 및 잡기 처리
        updatedPieces = updatedPieces.map(p =>
          stackIds.includes(p.id) ? { ...p, nodeId: targetNodeId } : p
        );

        if (targetNodeId) {
          const opponentPieces = updatedPieces.filter(
            p => p.nodeId === targetNodeId && p.team !== piece.team && !p.isFinished
          );
          if (opponentPieces.length > 0) {
            teamStats.captureCount += 1;
            const capturedTeams = new Set(opponentPieces.map(p => p.team));
            capturedTeams.forEach(capturedTeamId => {
              const capturedTeam = getTeam(capturedTeamId, prev);
              const count = opponentPieces.filter(p => p.team === capturedTeamId).length;
              logs.push(`💥 ${team?.name}이(가) ${capturedTeam?.name}의 말 ${count}개를 잡았습니다!`);
              
              trackEvent({
                category: 'Game',
                action: 'piece_capture',
                capturing_team: team?.name,
                captured_team: capturedTeam?.name,
                capture_count: count
              });
              
              // 대형 포획 내레이터 트리거
              const capturingTeamName = team?.name || piece.team;
              const capturedTeamName = capturedTeam?.name || capturedTeamId;
              
              setGameState(s => s ? {
                ...s,
                lastCapture: {
                  capturingTeam: capturingTeamName,
                  capturedTeam: capturedTeamName,
                  count,
                  id: `${Date.now()}-${pieceId}`
                }
              } : s);
            });
            updatedPieces = updatedPieces.map(p =>
              opponentPieces.some(cp => cp.id === p.id) ? { ...p, nodeId: null } : p
            );
          }
        }
      }

      nextStats[piece.team] = teamStats;

      // 승리 조건 체크: 해당 팀의 모든 말이 isFinished 상태인지 확인
      const allFinished = updatedPieces.filter(p => p.team === piece.team).every(p => p.isFinished);
      const winnerId = allFinished ? piece.team : prev.winnerId;

      if (winnerId) {
        logs.push(`🏆 축하합니다! ${team?.name}이(가) 최종 승리하였습니다!`);
        trackEvent({
          category: 'Game',
          action: 'game_complete',
          label: team?.name,
          winner_team: team?.name,
          total_turns: prev.logs.length // Approximate turn count from logs
        });
      }

      return { 
        ...prev, 
        pieces: updatedPieces, 
        logs, 
        stats: nextStats,
        winnerId
      };
    });
  }, [getTeam]);

  const restartGame = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      return initializeGame(prev.teams);
    });
  }, []);

  const resetGame = useCallback(() => {
    clearGameState();
    setGameState(null);
    trackEvent({ category: 'Game', action: 'game_reset' });
  }, []);

  const setFirstTurn = useCallback((teamId: TeamId) => {
    setGameState(prev => {
      if (!prev) return null;
      const team = prev.teams.find(t => t.id === teamId);
      return {
        ...prev,
        currentTurn: teamId,
        status: 'playing',
        startTime: Date.now(),
        logs: [...prev.logs, `👉 ${team?.name} 팀이 먼저 시작합니다!`]
      };
    });
  }, []);

  return { gameState, setGameState, movePiece, nextTurn, resetGame, restartGame, setFirstTurn };
}
