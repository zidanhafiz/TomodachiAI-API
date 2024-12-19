import { validator } from "hono-openapi/zod";
import { ZodSchema } from "zod";
import { formatZodError } from "../utils/zodErrorUtils";

const zValidator = (target: "json" | "form" | "query" | "param" | "header" | "cookie", schema: ZodSchema) => {
  return validator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: formatZodError(result.error) }, 400);
    }
  });
};

export { zValidator };
