import { z } from "zod";

export const tasbihPresetCreateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100),
  target: z.number().int().positive().max(10000),
  dhikr: z.string().min(1, "الذكر مطلوب"),
});

export const tasbihSessionCreateSchema = z.object({
  preset_id: z.string().uuid(),
  count: z.number().int().min(0),
});

export type TasbihPresetCreateInput = z.infer<typeof tasbihPresetCreateSchema>;
export type TasbihSessionCreateInput = z.infer<typeof tasbihSessionCreateSchema>;
