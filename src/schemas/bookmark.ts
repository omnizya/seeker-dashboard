import { z } from "zod";

export const bookmarkCreateSchema = z.object({
  ayah_id: z.number().int().positive(),
  surah_id: z.number().int().positive(),
  ayah_number: z.number().int().positive(),
  ayah_text: z.string().min(1),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const bookmarkDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type BookmarkCreateInput = z.infer<typeof bookmarkCreateSchema>;
export type BookmarkDeleteInput = z.infer<typeof bookmarkDeleteSchema>;
