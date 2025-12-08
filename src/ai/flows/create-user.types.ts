/**
 * @fileOverview Types and schemas for the createUser flow.
 */

import { z } from 'genkit';

export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string(),
  role: z.enum(['Employee', 'Admin', 'Super Admin', 'College', 'Industry']),
  phone: z.string().optional(),
  surname: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const CreateUserOutputSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string(),
});
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;
