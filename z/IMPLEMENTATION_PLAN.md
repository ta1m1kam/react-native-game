# シェイクゲームアプリ 実装計画

## 概要
スマホを振ってスコアを競うシンプルなゲームアプリ（Expo/React Native）

## 要件
- **ルール**: 10秒間にスマホを振った回数を競う
- **ランキング**: ローカル保存（将来オンライン対応可能な設計）
- **デザイン**: ミニマル・モダン
- **認証**: 匿名（ニックネームのみ）

---

## ディレクトリ構造

```
react-native-game/
├── app/                          # Expo Router
│   ├── _layout.tsx               # ルートレイアウト
│   ├── index.tsx                 # ホーム画面
│   ├── game.tsx                  # ゲーム画面
│   ├── result.tsx                # 結果画面
│   └── ranking.tsx               # ランキング画面
├── src/
│   ├── hooks/
│   │   ├── useShakeDetector.ts   # 振り検出
│   │   ├── useGameTimer.ts       # タイマー
│   │   └── useRanking.ts         # ランキング操作
│   ├── services/
│   │   └── ranking/
│   │       ├── types.ts
│   │       └── LocalRankingRepository.ts
│   ├── constants/
│   │   ├── game.ts               # 制限時間、閾値など
│   │   └── theme.ts              # カラー、フォント
│   └── types/
│       ├── game.ts
│       └── ranking.ts
├── app.json
└── package.json
```

---

## 画面構成

### 1. ホーム画面 (`app/index.tsx`)
- アプリタイトル
- ニックネーム入力（初回のみ）
- 「ゲームスタート」ボタン
- 「ランキング」ボタン

### 2. ゲーム画面 (`app/game.tsx`)
- カウントダウン (3, 2, 1, GO!)
- 残り時間表示
- リアルタイムスコア表示
- 振動フィードバック

### 3. 結果画面 (`app/result.tsx`)
- 最終スコア
- ランキング順位
- 「もう一度」「ランキング」「ホーム」ボタン

### 4. ランキング画面 (`app/ranking.tsx`)
- トップ10表示
- 順位、ニックネーム、スコア、日時

---

## コアロジック: 振り検出

```typescript
const detectShake = (current: AccelerometerData, prev: AccelerometerData) => {
  const delta = Math.sqrt(
    (current.x - prev.x) ** 2 +
    (current.y - prev.y) ** 2 +
    (current.z - prev.z) ** 2
  );
  return delta > SHAKE_THRESHOLD; // 1.8G推奨
};
```

**パラメータ**:
- `SHAKE_THRESHOLD`: 1.8 G（感度）
- `COOLDOWN_MS`: 100ms（連続検出防止）
- `UPDATE_INTERVAL`: 50ms（センサー更新間隔）

---

## データ構造

```typescript
interface RankingEntry {
  id: string;
  nickname: string;
  score: number;
  playedAt: number;
}

interface UserProfile {
  nickname: string;
  bestScore: number;
  totalPlays: number;
}
```

---

## 依存パッケージ

- expo ~54.0.0
- expo-router ~6.0.0
- expo-sensors ~15.0.0
- expo-haptics ~15.0.0
- @react-native-async-storage/async-storage ~2.2.0
- uuid ^9.0.0

---

## 将来のオンライン対応

- `RankingRepository`インターフェースで実装を抽象化済み
- `LocalRankingRepository` → `OnlineRankingRepository`に差し替え可能
- Supabase連携時は認証・リアルタイム同期を追加
