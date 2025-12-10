import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SessionTypeBadge } from '@/components/ui/session-type-badge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Session } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

interface SessionCardProps {
  session: Session;
  onDelete: (id: number) => void;
  onEdit?: (id: number) => void;
}

export function SessionCard({ session, onDelete, onEdit }: SessionCardProps) {
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

  const handleEdit = (e: any) => {
    e.stopPropagation();
    onEdit?.(session.id);
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
      <Card>
        <View style={styles.content}>
          <View style={styles.header}>
            <SessionTypeBadge type={session.type} />
            <View style={styles.actions}>
              <Pressable onPress={handleEdit} style={styles.iconButton} hitSlop={8}>
                <IconSymbol name="pencil" size={18} color={colors.icon} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.iconButton} hitSlop={8}>
                <IconSymbol name="trash" size={20} color="#ef4444" />
              </Pressable>
            </View>
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
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
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
