import { z } from 'zod';

const sessionExerciseSchema = z.object({
  exercise_id: z.number().optional(),
  name: z.string().min(2, 'Le nom de l\'exercice est requis'),
  reps: z.number().min(0, 'Les répétitions doivent être positives').nullable(),
  sets: z.number().min(1).nullable().optional(),
  duration: z.number().min(1).nullable().optional(),
  rest_time: z.number().min(0).nullable().optional(),
});

export const sessionSchema = z.object({
  program_id: z.number().nullable(),
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  type: z.enum(['AMRAP', 'HIIT', 'EMOM'], {
    errorMap: () => ({ message: 'Sélectionnez un type de séance' }),
  }),
  scheduled_date: z.string().nullable(),
  scheduled_time: z.string().nullable(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']),
  duration: z.number().min(1, 'La durée doit être supérieure à 0').nullable(),
  exercises: z.array(sessionExerciseSchema).min(1, 'Ajoutez au moins un exercice'),
});

export type SessionFormData = z.infer<typeof sessionSchema>;
export type SessionExerciseFormData = z.infer<typeof sessionExerciseSchema>;
