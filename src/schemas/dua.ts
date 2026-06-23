import { z } from "zod";

export const duaListCreateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100),
  category: z.string().optional(),
});

export const duaEntryCreateSchema = z.object({
  list_id: z.number().int().positive(),
  title: z.string().min(1, "العنوان مطلوب").max(200),
  content: z.string().min(1, "المحتوى مطلوب"),
  arabic_text: z.string().optional(),
});

export type DuaListCreateInput = z.infer<typeof duaListCreateSchema>;
export type DuaEntryCreateInput = z.infer<typeof duaEntryCreateSchema>;
