import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import agentModels from "../models/agent";
import { createAgentSchema } from "../utils/schemas/agentSchemas";
import { ElevenLabsApi } from "../utils/elevenlabsApi";

const idParamSchema = z.object({ id: z.string() });

const agents = new Hono<{
  Variables: {
    user_id: string;
  };
}>()
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const { id } = c.req.valid("param");
      const userId = c.get("user_id");

      const agentDB = await agentModels.getAgentById(id, userId);

      if (!agentDB) {
        return c.json({ error: "Agent not found" }, 404);
      }

      const elevenApiClient = new ElevenLabsApi(process.env.ELEVENLABS_API_KEY || "");

      const agent = await elevenApiClient.getAgent(id);

      return c.json({ data: agent });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get agent" }, 500);
    }
  })
  .post("/", zValidator("json", createAgentSchema), async (c) => {
    try {
      const { name, conversation_config } = c.req.valid("json");
      const userId = c.get("user_id");

      const elevenApiClient = new ElevenLabsApi(process.env.ELEVENLABS_API_KEY || "");

      const agent = await elevenApiClient.createAgent({
        name,
        conversation_config,
      });

      const agentDB = await agentModels.createAgent({
        id: agent.agent_id,
        language: conversation_config.agent.language,
        name,
        userId,
      });

      return c.json({ data: agentDB });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to create agent" }, 500);
    }
  });

export default agents;
