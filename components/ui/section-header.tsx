import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

/**
 * En-tête de section réutilisable avec titre optionnel et bouton d'action.
 * Utilisé dans plusieurs écrans (programs, sessions, workout).
 */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.header}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {action && <View>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
