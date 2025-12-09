import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Session } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

interface SessionCardProps {
  session: Session;
  onDelete: (id: number) => void;
}

const TYPE_COLORS = {
  AMRAP: '#3b82f6',
  HIIT: '#ef4444',
  EMOM: '#8b5cf6',
};

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDelete = (e: any) => {
    e.stopPropagation(); // Empêcher la navigation
    Alert.alert('Supprimer la séance', `Voulez-vous vraiment supprimer "${session.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => onDelete(session.id),
      },
    ]);
  };

  const handlePress = () => {
    router.push(`/session/${session.id}` as any);
  };

  const formatSchedule = () => {
    if (!session.scheduled_date) return null;
    const date = new Date(session.scheduled_date);
    let schedule = date.toLocaleDateString('fr-FR');
    if (session.scheduled_time) {
      schedule += ` à ${session.scheduled_time}`;
    }
    return schedule;
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View
              style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[session.type] + '20' }]}>
              <ThemedText style={[styles.typeText, { color: TYPE_COLORS[session.type] }]}>
                {session.type}
              </ThemedText>
            </View>
            <Pressable onPress={handleDelete} style={styles.deleteButton} hitSlop={8}>
              <IconSymbol name="trash" size={20} color="#ef4444" />
            </Pressable>
          </View>

          <ThemedText type="subtitle" style={styles.title}>
            {session.name}
          </ThemedText>

          <View style={styles.details}>
            {session.duration && (
              <View style={styles.detailItem}>
                <IconSymbol name="clock" size={16} color={colors.icon} />
                <ThemedText style={styles.detailText}>{session.duration} min</ThemedText>
              </View>
            )}
            {formatSchedule() && (
              <View style={styles.detailItem}>
                <IconSymbol name="calendar" size={16} color={colors.icon} />
                <ThemedText style={styles.detailText}>{formatSchedule()}</ThemedText>
              </View>
            )}
            {session.recurrence !== 'none' && (
              <View style={styles.detailItem}>
                <IconSymbol name="repeat" size={16} color={colors.icon} />
                <ThemedText style={styles.detailText}>
                  {session.recurrence === 'daily' && 'Quotidien'}
                  {session.recurrence === 'weekly' && 'Hebdomadaire'}
                  {session.recurrence === 'monthly' && 'Mensuel'}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ThemedView>
    </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  title: {
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
