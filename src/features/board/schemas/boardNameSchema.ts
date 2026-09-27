import { z } from "zod";

export const boardNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Board name is required"),
});

export type BoardNameFormValues = z.infer<typeof boardNameSchema>;
