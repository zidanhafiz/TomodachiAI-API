import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { openAPISpecs } from "hono-openapi";

import { authVerify } from "./middlewares/auth";
import { verifyUser } from "./middlewares/users";

import auth from "./routes/auth";
import users from "./routes/users";
import agents from "./routes/agents";
import apiDocs from "./routes/api-docs";
import promptTemplates from "./routes/prompt-templates";

const app = new Hono();

// Middlewares
app.use(logger());
app.use(cors());
app.use(csrf({ origin: "http://localhost:3000" }));
app.use(secureHeaders());

// OpenAPI Documentation
app.get(
  "/v1-api-docs",
  openAPISpecs(app, {
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
  })
);

app.route("/", apiDocs);

// Custom middlewares
app.use("/v1/*", authVerify);
app.use("/v1/users/:id", verifyUser);
app.use("/v1/users/:id/*", verifyUser);

// Routes
app.route("/auth", auth);
app.route("/v1/users", users);
app.route("/v1/agents", agents);
app.route("/v1/prompt-templates", promptTemplates);

export default {
  port: 4000,
  fetch: app.fetch,
  request: app.request,
};
