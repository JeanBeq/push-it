import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { SessionCard } from '@/features/sessions/components/session-card';
import { SessionForm } from '@/features/sessions/components/session-form';
import type { SessionFormData } from '@/features/sessions/schemas/session.schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { programRepository } from '@/services/database';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    createSession,
    deleteSession,
    fetchSessionsByProgram,
} from '@/store/slices/sessions.slice';
import type { Program } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { sessions, loading } = useAppSelector((state) => state.sessions);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [program, setProgram] = useState<Program | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      const programId = parseInt(id, 10);
      // Charger le programme
      programRepository.getById(programId).then(setProgram);
      // Charger les séances du programme
      dispatch(fetchSessionsByProgram(programId));
    }
  }, [id, dispatch]);

  const handleCreateSession = async (data: SessionFormData) => {
    await dispatch(createSession(data));
    setIsModalVisible(false);
  };

  const handleDeleteSession = async (sessionId: number) => {
    await dispatch(deleteSession(sessionId));
  };

  if (!program) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="list.bullet.clipboard" size={48} color={colors.tint} />
          </View>
          <ThemedText type="title">{program.name}</ThemedText>
          {program.description && (
            <ThemedText style={styles.description}>{program.description}</ThemedText>
          )}
          <ThemedText style={styles.date}>
            Créé le {new Date(program.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </ThemedText>
        </View>

        {/* Statistiques du programme */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <IconSymbol name="calendar" size={20} color={colors.tint} />
            <ThemedText style={styles.statValue}>{sessions.length}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {sessions.length > 1 ? 'Séances' : 'Séance'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Séances</ThemedText>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={() => setIsModalVisible(true)}>
              <IconSymbol name="plus" size={20} color="#fff" />
              <ThemedText style={styles.addButtonText}>Ajouter</ThemedText>
            </Pressable>
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="figure.run" size={48} color={colors.tabIconDefault} />
              <ThemedText style={styles.emptyText}>Aucune séance</ThemedText>
            </View>
          ) : (
            sessions.map((session: any) => (
              <SessionCard key={session.id} session={session} onDelete={handleDeleteSession} />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Nouvelle séance</ThemedText>
          </View>
          <SessionForm
            onSubmit={handleCreateSession}
            onCancel={() => setIsModalVisible(false)}
            submitLabel="Créer"
            programId={parseInt(id!, 10)}
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
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
