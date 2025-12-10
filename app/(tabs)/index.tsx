import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ProgramCard } from '@/features/programs/components/program-card';
import { ProgramForm } from '@/features/programs/components/program-form';
import type { ProgramFormData } from '@/features/programs/schemas/program.schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProgram, deleteProgram, fetchPrograms } from '@/store/slices/programs.slice';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

export default function ProgramsScreen() {
  const dispatch = useAppDispatch();
  const { programs, loading, error } = useAppSelector((state) => state.programs);
  const hasActiveWorkout = useAppSelector((state) => Boolean(state.workout.activeSessionId));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    console.log('ProgramsScreen mounted, fetching programs...');
    dispatch(fetchPrograms()).catch((err) => {
      console.error('Failed to fetch programs in useEffect:', err);
    });
  }, [dispatch]);

  // Afficher l'erreur si elle existe
  useEffect(() => {
    if (error) {
      console.error('Programs error state:', error);
    }
  }, [error]);

  const handleCreate = async (data: ProgramFormData) => {
    setIsCreating(true);
    try {
      console.log('handleCreate called with:', data);
      const result = await dispatch(createProgram(data)).unwrap();
      console.log('Programme créé avec succès:', result);
      setIsModalVisible(false);
      // Recharger la liste après création
      await dispatch(fetchPrograms());
    } catch (error) {
      console.error('Erreur lors de la création du programme:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteProgram(id));
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProgramCard program={item} onDelete={handleDelete} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="list.bullet.clipboard" size={64} color={colors.tabIconDefault} />
            {error ? (
              <>
                <ThemedText style={[styles.emptyText, { color: '#ef4444' }]}>Erreur</ThemedText>
                <ThemedText style={styles.emptySubtext}>{error}</ThemedText>
                <Pressable
                  style={[styles.retryButton, { backgroundColor: colors.tint }]}
                  onPress={() => dispatch(fetchPrograms())}>
                  <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Réessayer</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ThemedText style={styles.emptyText}>Aucun programme</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Créez votre premier programme d'entraînement
                </ThemedText>
              </>
            )}
          </View>
        }
        refreshing={loading}
        onRefresh={() => dispatch(fetchPrograms())}
      />

      <Pressable
        style={[styles.fab, { backgroundColor: colors.tint, bottom: hasActiveWorkout ? 120 : 24 }]}
        onPress={() => setIsModalVisible(true)}>
        <IconSymbol name="plus" size={24} color="#fff" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Nouveau programme</ThemedText>
          </View>
          <ProgramForm
            onSubmit={handleCreate}
            onCancel={() => setIsModalVisible(false)}
            submitLabel={isCreating ? "Création..." : "Créer"}
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
