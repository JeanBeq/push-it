import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { SessionCard } from '@/features/sessions/components/session-card';
import { SessionForm } from '@/features/sessions/components/session-form';
import type { SessionFormData } from '@/features/sessions/schemas/session.schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sessionExerciseRepository, sessionRepository } from '@/services/database';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSession, deleteSession, fetchSessions, updateSession } from '@/store/slices/sessions.slice';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

export default function SessionsScreen() {
  const dispatch = useAppDispatch();
  const { sessions, loading } = useAppSelector((state) => state.sessions);
  const hasActiveWorkout = useAppSelector((state) => Boolean(state.workout.activeSessionId));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionFormData | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleCreate = async (data: SessionFormData) => {
    const { exercises, ...sessionData } = data;
    if (editingSessionId) {
      await dispatch(updateSession({ id: editingSessionId, data: sessionData, exercises }));
    } else {
      await dispatch(createSession({ session: sessionData, exercises }));
    }
    setIsModalVisible(false);
    setEditingSession(null);
    setEditingSessionId(null);
  };

  const handleEdit = async (id: number) => {
    const session = await sessionRepository.getById(id);
    const details = await sessionExerciseRepository.getDetailsBySessionId(id);
    if (!session) return;
    setEditingSession({
      ...session,
      exercises: details.map((d) => ({
        exercise_id: d.exercise_id,
        name: d.exercise_name,
        reps: d.reps,
        sets: d.sets,
        duration: d.duration,
        rest_time: d.rest_time,
      })),
    } as SessionFormData);
    setEditingSessionId(id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteSession(id));
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SessionCard session={item} onDelete={handleDelete} onEdit={handleEdit} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="figure.run" size={64} color={colors.tabIconDefault} />
            <ThemedText style={styles.emptyText}>Aucune séance</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Créez votre première séance d'entraînement
            </ThemedText>
          </View>
        }
        refreshing={loading}
        onRefresh={() => dispatch(fetchSessions())}
      />

      <Pressable
        style={[styles.fab, { backgroundColor: colors.tint, bottom: hasActiveWorkout ? 120 : 24 }]}
        onPress={() => {
          setEditingSession(null);
          setEditingSessionId(null);
          setIsModalVisible(true);
        }}>
        <IconSymbol name="plus" size={24} color="#fff" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsModalVisible(false);
          setEditingSession(null);
          setEditingSessionId(null);
        }}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">{editingSessionId ? 'Modifier la séance' : 'Nouvelle séance'}</ThemedText>
          </View>
          <SessionForm
            onSubmit={handleCreate}
            onCancel={() => {
              setIsModalVisible(false);
              setEditingSession(null);
              setEditingSessionId(null);
            }}
            submitLabel={editingSessionId ? 'Mettre à jour' : 'Créer'}
            defaultValues={editingSession ?? undefined}
          />
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});
