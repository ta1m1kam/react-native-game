import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize } from '../src/constants/theme';

const NICKNAME_KEY = '@shake_game/nickname';

export default function HomeScreen() {
  const [nickname, setNickname] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NICKNAME_KEY).then((saved) => {
      if (saved) setNickname(saved);
      setIsLoaded(true);
    });
  }, []);

  const handleStartGame = async () => {
    if (!nickname.trim()) return;
    await AsyncStorage.setItem(NICKNAME_KEY, nickname.trim());
    router.push({ pathname: '/game', params: { nickname: nickname.trim() } });
  };

  const handleViewRanking = () => {
    router.push('/ranking');
  };

  if (!isLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SHAKE</Text>
          <Text style={styles.subtitle}>10秒間で何回振れる？</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="名前を入力"
            placeholderTextColor={colors.textSecondary}
            maxLength={12}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, !nickname.trim() && styles.disabledButton]}
            onPress={handleStartGame}
            disabled={!nickname.trim()}
          >
            <Text style={styles.primaryButtonText}>ゲームスタート</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleViewRanking}>
            <Text style={styles.secondaryButtonText}>ランキング</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.primary,
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
  disabledButton: {
    opacity: 0.4,
  },
});
