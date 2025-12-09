import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { programSchema, type ProgramFormData } from '../schemas/program.schema';

interface ProgramFormProps {
  onSubmit: (data: ProgramFormData) => void;
  onCancel: () => void;
  defaultValues?: ProgramFormData;
  submitLabel?: string;
}

export function ProgramForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = 'Créer',
}: ProgramFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues,
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Nom du programme *</ThemedText>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                errors.name && styles.inputError,
              ]}
              placeholder="Ex: Programme débutant"
              placeholderTextColor={colors.tabIconDefault}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <ThemedText style={styles.errorText}>{errors.name.message}</ThemedText>}
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Description (optionnelle)</ThemedText>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                errors.description && styles.inputError,
              ]}
              placeholder="Décrivez votre programme..."
              placeholderTextColor={colors.tabIconDefault}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && (
          <ThemedText style={styles.errorText}>{errors.description.message}</ThemedText>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.tabIconDefault }]}
          onPress={onCancel}
          disabled={isSubmitting}>
          <Text style={[styles.buttonText, { color: colors.background }]}>Annuler</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>{submitLabel}</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    opacity: 0.7,
  },
  submitButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
