import { useState, useCallback } from 'react';
import { rankingRepository } from '../services/ranking/LocalRankingRepository';
import type { RankingEntry } from '../types/ranking';

interface UseRankingReturn {
  rankings: RankingEntry[];
  isLoading: boolean;
  fetchRankings: (limit?: number) => Promise<void>;
  addScore: (nickname: string, score: number) => Promise<RankingEntry>;
  getRank: (score: number) => Promise<number>;
}

export function useRanking(): UseRankingReturn {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRankings = useCallback(async (limit: number = 10) => {
    setIsLoading(true);
    try {
      const data = await rankingRepository.getTopRankings(limit);
      setRankings(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addScore = useCallback(async (nickname: string, score: number) => {
    const entry = await rankingRepository.addEntry({
      nickname,
      score,
      playedAt: Date.now(),
    });
    return entry;
  }, []);

  const getRank = useCallback(async (score: number) => {
    return rankingRepository.getRank(score);
  }, []);

  return { rankings, isLoading, fetchRankings, addScore, getRank };
}
