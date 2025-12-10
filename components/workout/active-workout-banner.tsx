import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TYPE_COLORS } from '@/constants/session-types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElapsedSeconds } from '@/hooks/use-elapsed-seconds';
import { useAppSelector } from '@/store/hooks';
import { formatTime } from '@/utils/format-time';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

const COLOR_FALLBACK = '#0a7ea4';

export function ActiveWorkoutBanner() {
  const workout = useAppSelector((state) => state.workout);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const segments = useSegments() as string[];
  const params = useLocalSearchParams<{ id?: string }>();
  const elapsedSeconds = useElapsedSeconds();

  if (!workout.activeSessionId) return null;

  const inWorkoutScreen = segments.includes('workout');
  if (inWorkoutScreen) return null;

  const badgeColor = workout.sessionType ? TYPE_COLORS[workout.sessionType] : COLOR_FALLBACK;

  return (
    <ThemedView
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.card, bottom: 120 },
      ]}
    >
      <Pressable style={styles.pressable} onPress={() => router.push(`/workout/${workout.activeSessionId}`)}>
        <IconSymbol name="figure.walk" size={20} color={badgeColor} />
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {workout.sessionName ?? 'Entraînement en cours'}
        </ThemedText>
        <ThemedText style={[styles.time, { color: colors.text }]}>{formatTime(elapsedSeconds)}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
    zIndex: 999,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
  },
  time: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
});
