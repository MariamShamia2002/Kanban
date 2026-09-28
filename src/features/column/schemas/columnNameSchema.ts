import { z } from "zod";

export const columnNameSchema = z.object({
  name: z.string().trim().min(1, "Column name is required"),
});

export type ColumnNameFormValues = z.infer<typeof columnNameSchema>;
