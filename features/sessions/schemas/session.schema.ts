import { z } from 'zod';

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
});

export type SessionFormData = z.infer<typeof sessionSchema>;
