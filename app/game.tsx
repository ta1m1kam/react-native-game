import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useShakeDetector } from '../src/hooks/useShakeDetector';
import { useGameTimer } from '../src/hooks/useGameTimer';
import { useRanking } from '../src/hooks/useRanking';
import { useGameSounds } from '../src/hooks/useGameSounds';
import { colors, spacing, fontSize } from '../src/constants/theme';

export default function GameScreen() {
  const { nickname } = useLocalSearchParams<{ nickname: string }>();
  const { shakeCount, start: startShake, stop: stopShake, reset: resetShake } = useShakeDetector();
  const { gameState, startGame, resetGame } = useGameTimer();
  const { addScore } = useRanking();
  const { playCoinSound, playMilestoneSound } = useGameSounds();
  const prevShakeCountRef = useRef(0);

  const scoreScale = useSharedValue(1);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  useEffect(() => {
    if (shakeCount > 0 && shakeCount > prevShakeCountRef.current) {
      const isMilestone = shakeCount % 10 === 0;
      const popScale = isMilestone ? 1.4 : 1.15;

      // アニメーション
      scoreScale.value = withSequence(
        withSpring(popScale, { damping: 4, stiffness: 400 }),
        withSpring(1, { damping: 6, stiffness: 300 })
      );

      // サウンド再生
      if (isMilestone) {
        playMilestoneSound();
        // マイルストーン時は長めの振動
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 50, 30, 50]);
        }
      } else {
        playCoinSound();
        // 通常シェイク時は短い振動
        if (Platform.OS === 'android') {
          Vibration.vibrate(15);
        }
      }

      prevShakeCountRef.current = shakeCount;
    }
  }, [shakeCount, playCoinSound, playMilestoneSound]);

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
          <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
            <Text style={styles.scoreText}>{shakeCount}</Text>
            <Text style={styles.scoreLabel}>シェイク</Text>
          </Animated.View>
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
