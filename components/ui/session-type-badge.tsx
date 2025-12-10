import { ThemedText } from '@/components/themed-text';
import { TYPE_COLORS } from '@/constants/session-types';
import type { SessionType } from '@/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SessionTypeBadgeProps {
  type: SessionType;
  size?: 'small' | 'medium';
}

export function SessionTypeBadge({ type, size = 'medium' }: SessionTypeBadgeProps) {
  const styles = size === 'small' ? smallStyles : mediumStyles;
  const backgroundColor = TYPE_COLORS[type] + '20';
  const color = TYPE_COLORS[type];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <ThemedText style={[styles.text, { color }]}>{type}</ThemedText>
    </View>
  );
}

const mediumStyles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});

const smallStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
