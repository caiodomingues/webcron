import { z } from "zod";

export const callbackSchema = z.object({
  callback: z.string().url(),
  payload: z.union([z.string(), z.object({}).passthrough()]).optional(),
});
