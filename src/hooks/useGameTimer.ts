import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_DURATION_SECONDS, COUNTDOWN_SECONDS } from '../constants/game';
import type { GameState } from '../types/game';

interface UseGameTimerReturn {
  gameState: GameState;
  startGame: () => void;
  resetGame: () => void;
}

export function useGameTimer(): UseGameTimerReturn {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'idle',
    countdown: COUNTDOWN_SECONDS,
    timeRemaining: GAME_DURATION_SECONDS,
    score: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (gameState.phase === 'countdown') {
      intervalRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.countdown <= 1) {
            return {
              ...prev,
              phase: 'playing',
              countdown: 0,
            };
          }
          return {
            ...prev,
            countdown: prev.countdown - 1,
          };
        });
      }, 1000);
    } else if (gameState.phase === 'playing') {
      clearTimer();
      intervalRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemaining <= 1) {
            return {
              ...prev,
              phase: 'finished',
              timeRemaining: 0,
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [gameState.phase, clearTimer]);

  const startGame = useCallback(() => {
    setGameState({
      phase: 'countdown',
      countdown: COUNTDOWN_SECONDS,
      timeRemaining: GAME_DURATION_SECONDS,
      score: 0,
    });
  }, []);

  const resetGame = useCallback(() => {
    clearTimer();
    setGameState({
      phase: 'idle',
      countdown: COUNTDOWN_SECONDS,
      timeRemaining: GAME_DURATION_SECONDS,
      score: 0,
    });
  }, [clearTimer]);

  return { gameState, startGame, resetGame };
}
