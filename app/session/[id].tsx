import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sessionRepository } from '@/services/database';
import type { Session } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const TYPE_COLORS = {
  AMRAP: '#3b82f6',
  HIIT: '#ef4444',
  EMOM: '#8b5cf6',
};

const TYPE_DESCRIPTIONS = {
  AMRAP: 'As Many Rounds As Possible - Réalisez le maximum de tours dans le temps imparti',
  HIIT: 'High Intensity Interval Training - Alternance entre effort intense et récupération',
  EMOM: 'Every Minute On the Minute - Effectuez les répétitions au début de chaque minute',
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (id) {
      sessionRepository.getById(parseInt(id, 10)).then(setSession);
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
          <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[session.type] + '20' }]}>
            <ThemedText style={[styles.typeText, { color: TYPE_COLORS[session.type] }]}>
              {session.type}
            </ThemedText>
          </View>
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
          <View style={styles.emptyContainer}>
            <IconSymbol name="figure.walk" size={48} color={colors.tabIconDefault} />
            <ThemedText style={styles.emptyText}>
              Fonctionnalité à venir dans la Phase 3
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Vous pourrez ajouter des exercices à cette séance
            </ThemedText>
          </View>
        </View>

        {/* Bouton pour démarrer l'entraînement */}
        <Pressable 
          style={[styles.startButton, { backgroundColor: TYPE_COLORS[session.type] }]}
          onPress={() => alert('Fonctionnalité à venir en Phase 3 !')}>
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
});
