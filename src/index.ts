import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";

import { authVerify } from "./middlewares/auth";
import { verifyUser } from "./middlewares/users";
import { createOpenApiDocs } from "./middlewares/openapi";

import auth from "./routes/auth";
import users from "./routes/users";
import agents from "./routes/agents";
import apiDocs from "./routes/api-docs";
import promptTemplates from "./routes/prompt-templates";
import messages from "./routes/messages";
import voices from "./routes/voices";
import tts from "./routes/tts";

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const userId = c.req.query("userId");
    return {
      onOpen(_, ws) {
        ws.raw?.subscribe(`chat-messages-${userId}`);
        ws.raw?.subscribe(`agent-status-${userId}`);
        console.log(`WebSocket connection opened for user ${userId}`);
      },
      onClose: (_, ws) => {
        ws.raw?.unsubscribe(`chat-messages-${userId}`);
        ws.raw?.unsubscribe(`agent-status-${userId}`);
        console.log(`WebSocket connection closed for user ${userId}`);
      },
    };
  })
);

export const server = Bun.serve({
  fetch: app.fetch,
  websocket,
  port: 3001
});

// Middlewares
app.use(logger());
app.use(cors({ origin: [process.env.FRONTEND_URL || ""] }));
app.use(secureHeaders());

// OpenAPI Documentation
app.get("/v1-api-docs", createOpenApiDocs(app));
app.route("/", apiDocs);

// Custom middlewares
app.use("/v1/*", authVerify);
app.use("/v1/users/:id/*", verifyUser);

// Routes
app.route("/auth", auth);
app.route("/v1/users", users);
app.route("/v1/agents", agents);
app.route("/v1/agents", messages);
app.route("/v1/generate-prompt-templates", promptTemplates);
app.route("/v1/voices", voices);
app.route("/v1/tts", tts);

export default app;
