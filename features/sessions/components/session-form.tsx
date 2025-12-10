import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { exerciseRepository } from '@/services/database';
import type { RecurrenceType, SessionType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { sessionSchema, type SessionFormData } from '../schemas/session.schema';

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<SessionFormData>;
  submitLabel?: string;
  programId?: number;
}

const SESSION_TYPES: { value: SessionType; label: string; description: string }[] = [
  { value: 'AMRAP', label: 'AMRAP', description: 'As Many Rounds As Possible' },
  { value: 'HIIT', label: 'HIIT', description: 'High Intensity Interval Training' },
  { value: 'EMOM', label: 'EMOM', description: 'Every Minute On the Minute' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'daily', label: 'Tous les jours' },
  { value: 'weekly', label: 'Toutes les semaines' },
  { value: 'monthly', label: 'Tous les mois' },
];

export function SessionForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = 'Créer',
  programId,
}: SessionFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [availableExercises, setAvailableExercises] = useState<{ id: number; name: string }[]>([]);
  const [customExerciseName, setCustomExerciseName] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      program_id: programId ?? null,
      name: '',
      type: 'AMRAP',
      scheduled_date: null,
      scheduled_time: null,
      recurrence: 'none',
      duration: null,
      exercises: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        program_id: defaultValues.program_id ?? programId ?? null,
        name: defaultValues.name ?? '',
        type: defaultValues.type ?? 'AMRAP',
        scheduled_date: defaultValues.scheduled_date ?? null,
        scheduled_time: defaultValues.scheduled_time ?? null,
        recurrence: defaultValues.recurrence ?? 'none',
        duration: defaultValues.duration ?? null,
        exercises: defaultValues.exercises ?? [],
      });
    }
  }, [defaultValues, programId, reset]);

  const { fields, append, remove, update } = useFieldArray({ control, name: 'exercises' });

  useEffect(() => {
    exerciseRepository.getAll().then((list) => {
      setAvailableExercises(list.map((item) => ({ id: item.id, name: item.name })));
    });
  }, []);

  const selectedIds = useMemo(() => new Set(fields.map((f) => f.exercise_id)), [fields]);

  const toggleExercise = (exerciseId: number, name: string) => {
    const idx = fields.findIndex((f) => f.exercise_id === exerciseId);
    if (idx >= 0) {
      remove(idx);
    } else {
      append({ exercise_id: exerciseId, name, reps: null, sets: null, duration: null, rest_time: null });
    }
  };

  const addCustomExercise = () => {
    const trimmed = customExerciseName.trim();
    if (!trimmed) return;
    append({ name: trimmed, reps: null, sets: null, duration: null, rest_time: null });
    setCustomExerciseName('');
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Nom de la séance *</ThemedText>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                  errors.name && styles.inputError,
                ]}
                placeholder="Ex: Séance cardio intense"
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
          <ThemedText style={styles.label}>Type de séance *</ThemedText>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeContainer}>
                {SESSION_TYPES.map((type) => (
                  <Pressable
                    key={type.value}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: value === type.value ? colors.tint : colors.border,
                      },
                      value === type.value && styles.typeButtonActive,
                    ]}
                    onPress={() => onChange(type.value)}>
                    <ThemedText
                      style={[
                        styles.typeLabel,
                        value === type.value && { color: colors.tint, fontWeight: '600' },
                      ]}>
                      {type.label}
                    </ThemedText>
                    <ThemedText style={styles.typeDescription}>{type.description}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          />
          {errors.type && <ThemedText style={styles.errorText}>{errors.type.message}</ThemedText>}
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Durée (minutes)</ThemedText>
          <Controller
            control={control}
            name="duration"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                  errors.duration && styles.inputError,
                ]}
                placeholder="Ex: 30"
                placeholderTextColor={colors.tabIconDefault}
                onBlur={onBlur}
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  onChange(isNaN(num) ? null : num);
                }}
                value={value?.toString() || ''}
                keyboardType="numeric"
              />
            )}
          />
          {errors.duration && (
            <ThemedText style={styles.errorText}>{errors.duration.message}</ThemedText>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Date planifiée (optionnelle)</ThemedText>
          <Controller
            control={control}
            name="scheduled_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.tabIconDefault}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ''}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Heure planifiée (optionnelle)</ThemedText>
          <Controller
            control={control}
            name="scheduled_time"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="HH:MM"
                placeholderTextColor={colors.tabIconDefault}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ''}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Récurrence</ThemedText>
          <Controller
            control={control}
            name="recurrence"
            render={({ field: { onChange, value } }) => (
              <View style={styles.recurrenceContainer}>
                {RECURRENCE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.recurrenceButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: value === option.value ? colors.tint : colors.border,
                      },
                    ]}
                    onPress={() => onChange(option.value)}>
                    <ThemedText
                      style={[
                        styles.recurrenceLabel,
                        value === option.value && { color: colors.tint, fontWeight: '600' },
                      ]}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Exercices de la séance *</ThemedText>
          <ThemedText style={styles.helper}>Choisissez dans la liste ou ajoutez le vôtre.</ThemedText>

          <View style={styles.exerciseGrid}>
            {availableExercises.map((exo) => {
              const active = selectedIds.has(exo.id);
              return (
                <Pressable
                  key={exo.id}
                  style={[
                    styles.exerciseChip,
                    {
                      borderColor: active ? colors.tint : colors.border,
                      backgroundColor: active ? colors.tint + '15' : colors.card,
                    },
                  ]}
                  onPress={() => toggleExercise(exo.id, exo.name)}>
                  <ThemedText style={[styles.exerciseChipText, active && { color: colors.tint }]}>
                    {exo.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.customRow}>
            <TextInput
              placeholder="Ajouter un exercice perso"
              placeholderTextColor={colors.tabIconDefault}
              value={customExerciseName}
              onChangeText={setCustomExerciseName}
              style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            />
            <Pressable style={[styles.addButton, { backgroundColor: colors.tint }]} onPress={addCustomExercise}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Ajouter</Text>
            </Pressable>
          </View>

          {errors.exercises && (
            <ThemedText style={styles.errorText}>{errors.exercises.message as string}</ThemedText>
          )}

          {fields.length > 0 && (
            <View style={styles.selectedList}>
              {fields.map((field, index) => (
                <View key={field.id} style={[styles.selectedItem, { borderColor: colors.border }]}> 
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.selectedTitle}>{field.name}</ThemedText>
                    <ThemedText style={styles.helper}>Répétitions cibles (optionnel)</ThemedText>
                  </View>
                  <Controller
                    control={control}
                    name={`exercises.${index}.reps`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        keyboardType="number-pad"
                        value={value?.toString() ?? ''}
                        onChangeText={(text) => {
                          const num = parseInt(text, 10);
                          onChange(Number.isNaN(num) ? null : num);
                        }}
                        style={[styles.repsInput, { borderColor: colors.border, color: colors.text }]}
                        placeholder="0"
                        placeholderTextColor={colors.tabIconDefault}
                      />
                    )}
                  />
                  <Pressable onPress={() => remove(index)} style={styles.removeButton}>
                    <Text style={{ color: '#ef4444', fontWeight: '700' }}>Suppr.</Text>
                  </Pressable>
                </View>
              ))}
            </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
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
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  typeContainer: {
    gap: 12,
  },
  typeButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recurrenceLabel: {
    fontSize: 14,
  },
  helper: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  exerciseChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exerciseChipText: {
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  selectedList: {
    gap: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  selectedTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  repsInput: {
    width: 70,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
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
