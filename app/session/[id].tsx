import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SessionTypeBadge } from '@/components/ui/session-type-badge';
import { TYPE_COLORS, TYPE_DESCRIPTIONS } from '@/constants/session-types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sessionExerciseRepository, sessionRepository } from '@/services/database';
import { useAppDispatch } from '@/store/hooks';
import { startWorkout } from '@/store/slices';
import type { Session, SessionExerciseDetail } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [session, setSession] = useState<Session | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseDetail[]>([]);

  useEffect(() => {
    if (id) {
      sessionRepository.getById(parseInt(id, 10)).then(setSession);
      sessionExerciseRepository.getDetailsBySessionId(parseInt(id, 10)).then(setSessionExercises);
    }
  }, [id]);

  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const formatSchedule = () => {
    if (!session.scheduled_date) return null;
    const date = new Date(session.scheduled_date);
    let schedule = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (session.scheduled_time) {
      schedule += ` à ${session.scheduled_time}`;
    }
    return schedule;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SessionTypeBadge type={session.type} />
          <ThemedText type="title" style={styles.title}>
            {session.name}
          </ThemedText>
          <ThemedText style={styles.typeDescription}>
            {TYPE_DESCRIPTIONS[session.type]}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Détails
          </ThemedText>

          {session.duration && (
            <View style={styles.detailRow}>
              <IconSymbol name="clock" size={20} color={colors.icon} />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Durée</ThemedText>
                <ThemedText style={styles.detailValue}>{session.duration} minutes</ThemedText>
              </View>
            </View>
          )}

          {formatSchedule() && (
            <View style={styles.detailRow}>
              <IconSymbol name="calendar" size={20} color={colors.icon} />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Planification</ThemedText>
                <ThemedText style={styles.detailValue}>{formatSchedule()}</ThemedText>
              </View>
            </View>
          )}

          {session.recurrence !== 'none' && (
            <View style={styles.detailRow}>
              <IconSymbol name="repeat" size={20} color={colors.icon} />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Récurrence</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {session.recurrence === 'daily' && 'Tous les jours'}
                  {session.recurrence === 'weekly' && 'Toutes les semaines'}
                  {session.recurrence === 'monthly' && 'Tous les mois'}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Exercices
          </ThemedText>
          {sessionExercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="figure.walk" size={48} color={colors.tabIconDefault} />
              <ThemedText style={styles.emptyText}>Aucun exercice configuré</ThemedText>
              <ThemedText style={styles.emptySubtext}>Ajoutez des exercices lors de l'édition de la séance.</ThemedText>
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {sessionExercises.map((exo) => (
                <View key={exo.id} style={[styles.exerciseRow, { borderColor: colors.border }]}> 
                  <View style={styles.exerciseInfo}>
                    <ThemedText style={styles.exerciseName}>{exo.exercise_name}</ThemedText>
                    <ThemedText style={styles.exerciseMeta}>
                      {exo.reps ? `${exo.reps} reps` : 'Reps libres'}{exo.sets ? ` · ${exo.sets} séries` : ''}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color={colors.icon} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bouton pour démarrer l'entraînement */}
        <Pressable 
          style={[styles.startButton, { backgroundColor: TYPE_COLORS[session.type] }]}
          onPress={() => {
            dispatch(startWorkout({
              sessionId: session.id,
              sessionName: session.name,
              sessionType: session.type,
            }));
            router.push(`/workout/${session.id}`);
          }}>
          <IconSymbol name="play.fill" size={24} color="#fff" />
          <ThemedText style={styles.startButtonText}>
            Démarrer l'entraînement
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseList: {
    gap: 12,
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
    gap: 4,
  },
  exerciseName: {
    fontWeight: '700',
    fontSize: 16,
  },
  exerciseMeta: {
    opacity: 0.7,
  },
});
