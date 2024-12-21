import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";

const createOpenApiDocs = (app: Hono) => {
  return openAPISpecs(app, {
    documentation: {
      info: {
        title: "Tomodachiai API",
        version: "1.0.0",
        description: "API for Tomodachiai",
      },
      components: {
        securitySchemes: {
          "Bearer Auth": {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });
};

export { createOpenApiDocs };
