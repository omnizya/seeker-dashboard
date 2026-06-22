import { z } from "zod";

export const journalEntryCreateSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").max(200),
  content: z.string().min(1, "المحتوى مطلوب"),
  mood: z.enum(["happy", "neutral", "sad", "grateful", "anxious"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const journalEntryUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  mood: z.enum(["happy", "neutral", "sad", "grateful", "anxious"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const journalEntryDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type JournalEntryCreateInput = z.infer<typeof journalEntryCreateSchema>;
export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>;
