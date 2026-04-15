import { z } from 'zod';

// ---- Contacts ----

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// ---- Deals ----

export const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().int().positive('Value must be positive').optional(),
  contact_id: z.string().uuid().optional(),
  stage_id: z.string().uuid('Stage is required'),
  expected_close: z.string().optional(),
  description: z.string().optional(),
});

export type DealFormValues = z.infer<typeof dealSchema>;

// ---- Notes ----

export const noteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

// ---- Activities ----

export const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'task']),
  description: z.string().min(1, 'Description is required'),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

// ---- Pipeline Stages ----

export const stageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.number().int(),
  color: z.string().optional(),
});

export type StageFormValues = z.infer<typeof stageSchema>;

// ---- Tags ----

export const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional(),
});

export type TagFormValues = z.infer<typeof tagSchema>;
