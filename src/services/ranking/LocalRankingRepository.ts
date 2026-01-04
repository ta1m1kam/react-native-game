import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import type { RankingEntry, RankingData, RankingRepository } from '../../types/ranking';

const STORAGE_KEY = '@shake_game/ranking';
const DATA_VERSION = 1;

export class LocalRankingRepository implements RankingRepository {
  private async getData(): Promise<RankingData> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: DATA_VERSION, entries: [], lastUpdated: Date.now() };
    }
    return JSON.parse(raw);
  }

  private async saveData(data: RankingData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getTopRankings(limit: number = 10): Promise<RankingEntry[]> {
    const data = await this.getData();
    return data.entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async addEntry(entry: Omit<RankingEntry, 'id'>): Promise<RankingEntry> {
    const data = await this.getData();
    const newEntry: RankingEntry = {
      ...entry,
      id: uuidv4(),
    };
    data.entries.push(newEntry);
    data.lastUpdated = Date.now();
    await this.saveData(data);
    return newEntry;
  }

  async getUserBestScore(nickname: string): Promise<number | null> {
    const data = await this.getData();
    const userEntries = data.entries.filter((e) => e.nickname === nickname);
    if (userEntries.length === 0) return null;
    return Math.max(...userEntries.map((e) => e.score));
  }

  async getRank(score: number): Promise<number> {
    const data = await this.getData();
    const higherScores = data.entries.filter((e) => e.score > score);
    return higherScores.length + 1;
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export const rankingRepository = new LocalRankingRepository();
