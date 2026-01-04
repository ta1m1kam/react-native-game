export interface GameResult {
  score: number;
  duration: number;
  timestamp: number;
}

export interface GameState {
  phase: 'idle' | 'countdown' | 'playing' | 'finished';
  countdown: number;
  timeRemaining: number;
  score: number;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}
