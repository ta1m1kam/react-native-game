import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRanking } from '../src/hooks/useRanking';
import { colors, spacing, fontSize } from '../src/constants/theme';

export default function ResultScreen() {
  const { score, nickname } = useLocalSearchParams<{ score: string; nickname: string }>();
  const { getRank } = useRanking();
  const [rank, setRank] = useState<number | null>(null);

  const scoreNum = parseInt(score || '0', 10);

  useEffect(() => {
    getRank(scoreNum).then(setRank);
  }, [scoreNum]);

  const handlePlayAgain = () => {
    router.replace({ pathname: '/game', params: { nickname } });
  };

  const handleViewRanking = () => {
    router.push('/ranking');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.resultSection}>
          <Text style={styles.label}>結果</Text>
          <Text style={styles.score}>{scoreNum}</Text>
          <Text style={styles.unit}>シェイク</Text>

          {rank !== null && (
            <View style={styles.rankContainer}>
              <Text style={styles.rankLabel}>現在の順位</Text>
              <Text style={styles.rank}>#{rank}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handlePlayAgain}>
            <Text style={styles.primaryButtonText}>もう一度</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleViewRanking}>
            <Text style={styles.secondaryButtonText}>ランキング</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleGoHome}>
            <Text style={styles.linkButtonText}>ホームへ戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  resultSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: fontSize.lg,
    color: colors.secondary,
  },
  score: {
    fontSize: 120,
    fontWeight: '900',
    color: colors.primary,
    marginVertical: spacing.sm,
  },
  unit: {
    fontSize: fontSize.xl,
    color: colors.secondary,
    marginTop: -spacing.md,
  },
  rankContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  rankLabel: {
    fontSize: fontSize.md,
    color: colors.secondary,
  },
  rank: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.accent,
  },
  buttonSection: {
    gap: spacing.md,
  },
  button: {
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  linkButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  linkButtonText: {
    color: colors.secondary,
    fontSize: fontSize.md,
  },
});
