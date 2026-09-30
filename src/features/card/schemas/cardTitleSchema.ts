import { z } from "zod";

export const cardTitleSchema = z.object({
  title: z.string().trim().min(1, "Card title is required"),
});

export type CardTitleFormValues = z.infer<typeof cardTitleSchema>;
