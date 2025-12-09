import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Program } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

interface ProgramCardProps {
  program: Program;
  onDelete: (id: number) => void;
}

export function ProgramCard({ program, onDelete }: ProgramCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDelete = (e: any) => {
    e.stopPropagation(); // Empêcher la navigation
    Alert.alert('Supprimer le programme', `Voulez-vous vraiment supprimer "${program.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => onDelete(program.id),
      },
    ]);
  };

  const handlePress = () => {
    router.push(`/program/${program.id}` as any);
  };

  return (
    <ThemedView style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable 
        style={styles.content} 
        onPress={handlePress}
        android_ripple={{ color: colors.tint + '20' }}
      >
        <View style={styles.header}>
          <IconSymbol name="list.bullet.clipboard" size={24} color={colors.tint} />
          <ThemedText type="subtitle" style={styles.title}>
            {program.name}
          </ThemedText>
        </View>
        {program.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {program.description}
          </ThemedText>
        )}
        <ThemedText style={styles.date}>
          Créé le {new Date(program.created_at).toLocaleDateString('fr-FR')}
        </ThemedText>
      </Pressable>

      <Pressable 
        onPress={handleDelete} 
        style={styles.deleteButton}
        hitSlop={8}
      >
        <IconSymbol name="trash" size={20} color="#ef4444" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
});
