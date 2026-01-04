import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useRanking } from '../src/hooks/useRanking';
import { colors, spacing, fontSize } from '../src/constants/theme';
import type { RankingEntry } from '../src/types/ranking';

export default function RankingScreen() {
  const { rankings, isLoading, fetchRankings } = useRanking();

  useEffect(() => {
    fetchRankings(20);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item, index }: { item: RankingEntry; index: number }) => (
    <View style={styles.rankItem}>
      <View style={styles.rankNumber}>
        <Text style={[styles.rank, index < 3 && styles.topRank]}>#{index + 1}</Text>
      </View>
      <View style={styles.rankInfo}>
        <Text style={styles.nickname}>{item.nickname}</Text>
        <Text style={styles.date}>{formatDate(item.playedAt)}</Text>
      </View>
      <Text style={styles.score}>{item.score}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ランキング</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : rankings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>まだ記録がありません</Text>
          <Text style={styles.emptySubtext}>プレイして最初の記録を作ろう！</Text>
        </View>
      ) : (
        <FlatList
          data={rankings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  rankNumber: {
    width: 50,
  },
  rank: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.secondary,
  },
  topRank: {
    color: colors.accent,
  },
  rankInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  score: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: colors.primary,
  },
});
