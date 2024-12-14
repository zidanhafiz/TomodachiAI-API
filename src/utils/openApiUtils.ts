import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

export const createDescription = (
  tags: string[],
  description: string,
  successResponseSchema: z.ZodType,
  errorResponseSchema: z.ZodType,
  security: boolean = false,
) => {
  return describeRoute({
    tags,
    description,
    security: security ? [{ "Bearer Auth": [] }] : [],
    responses: {
      200: {
        description: "Success response",
        content: {
          "application/json": {
            schema: resolver(successResponseSchema),
          },
        },
      },
      500: {
        description: "Error response",
        content: {
          "application/json": {
            schema: resolver(errorResponseSchema),
          },
        },
      },
    },
  });
};
