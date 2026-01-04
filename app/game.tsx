import { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useShakeDetector } from '../src/hooks/useShakeDetector';
import { useGameTimer } from '../src/hooks/useGameTimer';
import { useRanking } from '../src/hooks/useRanking';
import { colors, spacing, fontSize } from '../src/constants/theme';

export default function GameScreen() {
  const { nickname } = useLocalSearchParams<{ nickname: string }>();
  const { shakeCount, start: startShake, stop: stopShake, reset: resetShake } = useShakeDetector();
  const { gameState, startGame, resetGame } = useGameTimer();
  const { addScore } = useRanking();

  useEffect(() => {
    startGame();
    return () => {
      resetGame();
      resetShake();
    };
  }, []);

  useEffect(() => {
    if (gameState.phase === 'playing') {
      startShake();
    } else if (gameState.phase === 'finished') {
      stopShake();
    }
  }, [gameState.phase]);

  useEffect(() => {
    if (gameState.phase === 'finished') {
      const saveAndNavigate = async () => {
        await addScore(nickname || 'Anonymous', shakeCount);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({
          pathname: '/result',
          params: { score: shakeCount.toString(), nickname: nickname || 'Anonymous' },
        });
      };
      saveAndNavigate();
    }
  }, [gameState.phase, shakeCount, nickname]);

  const renderContent = () => {
    if (gameState.phase === 'countdown') {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.countdownText}>{gameState.countdown}</Text>
          <Text style={styles.readyText}>準備...</Text>
        </View>
      );
    }

    if (gameState.phase === 'playing') {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.timerText}>{gameState.timeRemaining}</Text>
          <Text style={styles.timerLabel}>秒</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{shakeCount}</Text>
            <Text style={styles.scoreLabel}>シェイク</Text>
          </View>
          <Text style={styles.instruction}>スマホを振れ！</Text>
        </View>
      );
    }

    if (gameState.phase === 'finished') {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.finishedText}>終了！</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  countdownText: {
    fontSize: 160,
    fontWeight: '900',
    color: colors.primary,
  },
  readyText: {
    fontSize: fontSize.xl,
    color: colors.secondary,
    marginTop: spacing.md,
  },
  timerText: {
    fontSize: 80,
    fontWeight: '900',
    color: colors.accent,
  },
  timerLabel: {
    fontSize: fontSize.lg,
    color: colors.secondary,
    marginTop: -spacing.sm,
  },
  scoreContainer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: fontSize.score,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: fontSize.lg,
    color: colors.secondary,
    marginTop: -spacing.sm,
  },
  instruction: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xxl,
  },
  finishedText: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.success,
  },
});
