import { z } from 'zod';

export const programSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  description: z.string().max(200, 'La description ne peut pas dépasser 200 caractères').optional(),
});

export type ProgramFormData = z.infer<typeof programSchema>;
