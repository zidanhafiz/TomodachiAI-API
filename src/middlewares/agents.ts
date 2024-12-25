import { createMiddleware } from "hono/factory";
import agentModels from "../models/agent";
import { Agent } from "@prisma/client";

const verifyUserAgent = createMiddleware<{
  Variables: {
    user_id: string;
    agent: Agent;
  };
}>(async (c, next) => {
  const agentId = c.req.param("agentId");
  const userId = c.get("user_id");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!agentId) {
    return c.json({ error: "Agent ID is required" }, 400);
  }

  const agentDB = await agentModels.getAgentById(agentId, userId);

  if (!agentDB) {
    return c.json({ error: "Agent not found" }, 404);
  }

  c.set("agent", agentDB);

  await next();
});

export { verifyUserAgent };
