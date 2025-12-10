import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DetailItemProps {
  icon: string;
  label: string;
  value?: string | number;
}

/**
 * Affiche un détail (icône + label + valeur).
 * Utilisé dans session/program/workout details.
 */
export function DetailItem({ icon, label, value }: DetailItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.item}>
      <IconSymbol name={icon as any} size={16} color={colors.icon} />
      <ThemedText style={styles.label}>{label}</ThemedText>
      {value !== undefined && <ThemedText style={styles.value}>{value}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    opacity: 0.8,
  },
  value: {
    marginLeft: 'auto',
    fontWeight: '600',
  },
});
