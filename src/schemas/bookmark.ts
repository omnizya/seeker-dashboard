import { z } from "zod";

export const bookmarkCreateSchema = z.object({
  ayah_id: z.number().int().positive(),
  surah_id: z.number().int().positive().optional(),
  ayah_number: z.number().int().positive().optional(),
  ayah_text: z.string().min(1),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional(),
});

export const bookmarkDeleteSchema = z.object({
  id: z.number().int().positive(),
});

export type BookmarkCreateInput = z.infer<typeof bookmarkCreateSchema>;
export type BookmarkDeleteInput = z.infer<typeof bookmarkDeleteSchema>;
