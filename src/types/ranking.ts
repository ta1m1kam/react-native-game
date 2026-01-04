export interface RankingEntry {
  id: string;
  nickname: string;
  score: number;
  playedAt: number;
}

export interface RankingData {
  version: number;
  entries: RankingEntry[];
  lastUpdated: number;
}

export interface UserProfile {
  nickname: string;
  bestScore: number;
  totalPlays: number;
  createdAt: number;
}

export interface RankingRepository {
  getTopRankings(limit: number): Promise<RankingEntry[]>;
  addEntry(entry: Omit<RankingEntry, 'id'>): Promise<RankingEntry>;
  getUserBestScore(nickname: string): Promise<number | null>;
  getRank(score: number): Promise<number>;
  clearAll(): Promise<void>;
}
