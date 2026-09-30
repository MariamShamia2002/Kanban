import { z } from "zod";

/** Swatches offered when creating a label. */
export const LABEL_COLORS = ["#B0435A", "#B26F22", "#3E7650", "#7250A0", "#217A80", "#736A61"] as const;

export const labelSchema = z.object({
  name: z.string().trim().min(1, "Label name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color such as #F59E0B"),
});

export type LabelFormValues = z.infer<typeof labelSchema>;
