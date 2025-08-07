import { z } from "zod";

export const jobSchema = z.object({
  callback: z.string().url(),
  payload: z.union([z.string(), z.object({}).passthrough()]).optional(),
  recurrency: z.number().int().min(0).optional(),
  limit: z.number().int().min(0).optional(),
});
