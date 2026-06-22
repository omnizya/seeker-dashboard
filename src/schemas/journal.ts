import { z } from "zod";

export const journalEntryCreateSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").max(200),
  content: z.string().min(1, "المحتوى مطلوب"),
  mood: z.enum(["happy", "calm", "sad", "anxious", "grateful", "reflective", "neutral"]).optional(),
  tags: z.array(z.string()).optional(),
  entry_type: z.string().optional(),
  is_private: z.boolean().optional(),
});

export const journalEntryUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  mood: z.enum(["happy", "calm", "sad", "anxious", "grateful", "reflective", "neutral"]).optional(),
  tags: z.array(z.string()).optional(),
  entry_type: z.string().optional(),
  is_private: z.boolean().optional(),
});

export const journalEntryDeleteSchema = z.object({
  id: z.number().int().positive(),
});

export type JournalEntryCreateInput = z.infer<typeof journalEntryCreateSchema>;
export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>;
