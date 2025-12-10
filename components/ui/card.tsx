import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

interface CardProps {
  onPress?: () => void;
  children: ReactNode;
}

/**
 * Composant Card réutilisable pour afficher du contenu dans un conteneur stylisé.
 * Utilisé par ProgramCard et SessionCard.
 */
export function Card({ onPress, children }: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const content = (
    <ThemedView style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </ThemedView>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
});
