import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SessionTypeBadge } from '@/components/ui/session-type-badge';
import { TYPE_COLORS } from '@/constants/session-types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElapsedSeconds } from '@/hooks/use-elapsed-seconds';
import { programRepository, sessionExerciseRepository, sessionRepository } from '@/services/database';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { finishWorkout, pauseWorkout, resumeWorkout, startWorkout } from '@/store/slices';
import type { Session } from '@/types';
import { formatTime } from '@/utils/format-time';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    Vibration,
    View,
} from 'react-native';

type WorkoutExercise = {
  id: string;
  name: string;
  reps: number;
  plannedReps: number | null;
};

type WorkoutSummary = {
  totalSeconds: number;
  totalReps: number;
  perExercise: { name: string; reps: number; plannedReps: number | null }[];
  programName: string;
  exerciseCount: number;
};

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const workout = useAppSelector((state) => state.workout);
  const startedRef = useRef(false);

  const [session, setSession] = useState<Session | null>(null);
  const elapsedSeconds = useElapsedSeconds();

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [programName, setProgramName] = useState('Sans programme');
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const alertSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!id) return;
    sessionRepository.getById(parseInt(id, 10)).then((value) => {
      setSession(value);
      if (value?.program_id) {
        programRepository.getById(value.program_id).then((p) => {
          if (p?.name) setProgramName(p.name);
        });
      }
    });
    sessionExerciseRepository.getDetailsBySessionId(parseInt(id, 10)).then((list) => {
      setExercises(
        list.map((exo) => ({
          id: String(exo.id),
          name: exo.exercise_name,
          reps: exo.reps ?? 0,
          plannedReps: exo.reps,
        }))
      );
    });
  }, [id]);

  useEffect(() => {
    if (!session) return;
    if (workout.activeSessionId === session.id) {
      startedRef.current = true;
      return;
    }
    if (!startedRef.current && workout.activeSessionId === null) {
      dispatch(
        startWorkout({
          sessionId: session.id,
          sessionName: session.name,
          sessionType: session.type,
        })
      );
      startedRef.current = true;
    }
  }, [session, workout.activeSessionId, dispatch]);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => undefined);
    return () => {
      alertSoundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const computeElapsedSeconds = useCallback(() => {
    if (!workout.activeSessionId) return 0;
    const base = workout.elapsedBeforePause;
    const running = !workout.isPaused && workout.startedAt ? Date.now() - workout.startedAt : 0;
    return Math.floor((base + running) / 1000);
  }, [workout.activeSessionId, workout.elapsedBeforePause, workout.isPaused, workout.startedAt]);

  useEffect(() => {
    if (!workout.activeSessionId || workout.isPaused) return;
    const interval = setInterval(() => {}, 1000);
    return () => clearInterval(interval);
  }, [workout.activeSessionId, workout.isPaused]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Timer will update via hook
      }
    });
    return () => sub.remove();
  }, []);

  const triggerAlert = async () => {
    try {
      if (!alertSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync({
          uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
        });
        alertSoundRef.current = sound;
      }
      await alertSoundRef.current.replayAsync();
    } catch {
      Vibration.vibrate(120);
    } finally {
      Haptics.selectionAsync().catch(() => undefined);
    }
  };

  const togglePause = () => {
    if (!workout.activeSessionId) return;
    if (workout.isPaused) {
      dispatch(resumeWorkout());
    } else {
      dispatch(pauseWorkout());
    }
    triggerAlert();
  };

  const confirmFinish = () => {
    if (workout.activeSessionId && !workout.isPaused) {
      dispatch(pauseWorkout());
    }
    Alert.alert(
      "Terminer l'entraînement",
      'Vous pourrez retrouver vos données sur l’écran précédent.',
      [
        { text: 'Reprendre', style: 'cancel', onPress: () => dispatch(resumeWorkout()) },
        {
          text: 'Terminer',
          style: 'destructive',
          onPress: () => {
            buildSummary();
            triggerAlert();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const buildSummary = () => {
    const totalSeconds = computeElapsedSeconds();
    const perExercise = exercises.map((item) => ({
      name: item.name,
      reps: item.reps,
      plannedReps: item.plannedReps,
    }));
    const totalRepsValue = perExercise.reduce((acc, item) => acc + item.reps, 0);
    setSummary({
      totalSeconds,
      totalReps: totalRepsValue,
      perExercise,
      programName,
      exerciseCount: perExercise.length,
    });
    setShowSummary(true);
  };

  const closeSummary = () => {
    setShowSummary(false);
    dispatch(finishWorkout());
    startedRef.current = true; // avoid auto-restart on unmount
    router.back();
  };

  const updateExerciseReps = (exerciseId: string, value: string) => {
    const parsed = Number.parseInt(value, 10);
    setExercises((current) =>
      current.map((item) =>
        item.id === exerciseId ? { ...item, reps: Number.isNaN(parsed) ? 0 : parsed } : item
      )
    );
  };

  const totalReps = useMemo(
    () => exercises.reduce((acc, curr) => acc + curr.reps, 0),
    [exercises]
  );

  const displayedSeconds = elapsedSeconds;

  const isPaused = workout.isPaused;
  const hasActiveWorkout = Boolean(workout.activeSessionId);

  if (!session) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {isPaused && hasActiveWorkout && (
        <View style={[styles.pauseBanner, { backgroundColor: colors.card, borderColor: colors.tint }]}>
          <IconSymbol name="pause.fill" size={16} color={colors.tint} />
          <ThemedText style={[styles.pauseText, { color: colors.text }]}>En pause</ThemedText>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <SessionTypeBadge type={session.type} />
          <ThemedText type="title" style={styles.title}>
            {session.name}
          </ThemedText>
            <ThemedText style={styles.modeLabel}>Temps écoulé</ThemedText>
        </View>

        <View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.timerHeader}>
            <ThemedText type="subtitle">Chronomètre</ThemedText>
              <View style={[styles.badge, { backgroundColor: TYPE_COLORS[session.type] + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: TYPE_COLORS[session.type] }]}>Écoulé</ThemedText>
              </View>
          </View>

          <ThemedText style={[styles.timerValue, { color: colors.text }]}>
            {formatTime(displayedSeconds)}
          </ThemedText>

            <ThemedText style={styles.helperText}>
              Le chronomètre tourne en continu pour cette séance
            </ThemedText>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.controlButton, isPaused ? styles.resumeButton : styles.pauseButton]}
            onPress={togglePause}
          >
            <IconSymbol name={isPaused ? 'play.fill' : 'pause.fill'} size={18} color="#fff" />
            <ThemedText style={styles.controlText}>
              {isPaused ? 'Reprendre' : 'Pause'}
            </ThemedText>
          </Pressable>

          <Pressable style={[styles.controlButton, styles.finishButton]} onPress={confirmFinish}>
            <IconSymbol name="stop.fill" size={18} color="#fff" />
            <ThemedText style={styles.controlText}>Terminer</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Exercices de la séance</ThemedText>
            <View style={[styles.badge, { backgroundColor: colors.border }]}>
              <ThemedText style={[styles.badgeText, { color: colors.text }]}>Total reps: {totalReps}</ThemedText>
            </View>
          </View>

          {exercises.length === 0 ? (
            <View style={styles.emptyBox}>
              <IconSymbol name="figure.run" size={36} color={colors.icon} />
              <ThemedText style={styles.helperText}>Aucun exercice configuré pour cette séance</ThemedText>
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {exercises.map((item) => (
                <View key={item.id} style={[styles.exerciseRow, { borderColor: colors.border }]}> 
                  <View style={styles.exerciseInfo}>
                    <ThemedText style={[styles.exerciseName, { color: colors.text }]}>{item.name}</ThemedText>
                    <ThemedText style={styles.exerciseHint}>
                      {item.plannedReps ? `${item.plannedReps} reps prévues` : 'Libre'}
                    </ThemedText>
                  </View>
                  <View style={styles.exerciseReps}>
                    <TextInput
                      keyboardType="number-pad"
                      value={item.reps.toString()}
                      onChangeText={(value) => updateExerciseReps(item.id, value)}
                      style={[styles.repsInput, { borderColor: colors.border, color: colors.text }]}
                      placeholderTextColor={colors.icon}
                    />
                    <ThemedText style={styles.repsLabel}>reps</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSummary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSummary}>
        <ThemedView style={[styles.summaryContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Tableau de bord</ThemedText>
            <ThemedText style={styles.helperText}>Bilan de la séance</ThemedText>
          </View>

          {summary && (
            <ScrollView contentContainerStyle={styles.summaryContent}>
              <View style={[styles.summaryCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Temps total</ThemedText>
                  <ThemedText style={styles.summaryValue}>{formatTime(summary.totalSeconds)}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Total répétitions</ThemedText>
                  <ThemedText style={styles.summaryValue}>{summary.totalReps}</ThemedText>
                </View>
              </View>

              <View style={[styles.summaryCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Programme</ThemedText>
                  <ThemedText style={styles.summaryValue}>{summary.programName}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Exercices</ThemedText>
                  <ThemedText style={styles.summaryValue}>{summary.exerciseCount}</ThemedText>
                </View>
              </View>

              <View style={[styles.summaryCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Répétitions par exercice</ThemedText>
                {summary.perExercise.map((item, idx) => (
                  <View key={`${item.name}-${idx}`} style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>{item.name}</ThemedText>
                    <ThemedText style={styles.summaryValue}>{item.reps}</ThemedText>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <Pressable style={[styles.summaryCloseButton, styles.finishButton]} onPress={closeSummary}>
            <IconSymbol name="checkmark" size={18} color="#fff" />
            <ThemedText style={styles.controlText}>Terminer</ThemedText>
          </Pressable>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    marginBottom: 4,
  },
  modeLabel: {
    opacity: 0.7,
  },
  timerCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timerValue: {
    fontSize: 88,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 96,
    textAlign: 'center',
  },
  helperText: {
    opacity: 0.7,
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  pauseButton: {
    backgroundColor: '#1f2937',
  },
  resumeButton: {
    backgroundColor: '#10b981',
  },
  finishButton: {
    backgroundColor: '#ef4444',
  },
  summaryContainer: {
    flex: 1,
  },
  summaryContent: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: '700',
  },
  controlText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    gap: 6,
  },
  inputWrapperSmall: {
    width: 80,
    gap: 6,
  },
  inputLabel: {
    opacity: 0.7,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    height: 48,
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseHint: {
    opacity: 0.6,
    fontSize: 12,
  },
  exerciseReps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repsInput: {
    width: 70,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  repsLabel: {
    fontWeight: '600',
  },
  pauseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pauseText: {
    fontWeight: '700',
  },
  summaryCloseButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#e5e7eb',
  },
  modalConfirm: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontWeight: '700',
  },
  modalConfirmText: {
    color: '#fff',
  },
});
