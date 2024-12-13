import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { authVerify } from "./middlewares/auth";
import { verifyUser } from "./middlewares/users";

import auth from "./routes/auth";
import users from "./routes/users";
import agents from "./routes/agents";

const app = new Hono();

// Middlewares
app.use(logger());
app.use(cors());
app.use(csrf());
app.use(secureHeaders());

// Custom middlewares
app.use("/v1/*", authVerify);
app.use("/v1/users/:id", verifyUser);

// Routes
app.route("/auth", auth);
app.route("/v1/users", users);
app.route("/v1/agents", agents);

export default {
  port: 4000,
  fetch: app.fetch,
};
