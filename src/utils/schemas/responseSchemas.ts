import { z } from "zod";
import "zod-openapi/extend";

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: "Failed to..." }),
});
