import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import { ElevenLabsClient } from "elevenlabs";

import agentModels from "../models/agent";
import { createAgentSchema, deleteAgentSchema, getAgentSchema, listAgentsSchema, updateAgentSchema } from "../utils/schemas/agentSchemas";
import { createDescription } from "../utils/openApiUtils";
import { toSnakeCase } from "../utils/snakeCaseFormat";
import { deductCredits } from "../utils/userUtils";

const agents = new Hono<{
  Variables: {
    user_id: string;
  };
}>()
  .post(
    "/",
    createDescription(["Agents"], "Create an agent", createAgentSchema.successResponse, createAgentSchema.errorResponse, true),
    zValidator("json", createAgentSchema.requestBody),
    async (c) => {
      try {
        const { name, conversation_config } = c.req.valid("json");
        const userId = c.get("user_id");

        const elevenLabsClient = new ElevenLabsClient({
          apiKey: process.env.ELEVENLABS_API_KEY || "",
        });

        const agent = await elevenLabsClient.conversationalAi.createAgent({
          name,
          conversation_config,
        });

        const agentDB = await agentModels.createAgent({
          id: agent.agent_id,
          language: conversation_config.agent.language,
          name,
          userId,
        });

        await deductCredits(userId);

        return c.json({ data: agentDB });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to create agent" }, 500);
      }
    }
  )
  .get(
    "/",
    createDescription(["Agents"], "List agents", listAgentsSchema.successResponse, listAgentsSchema.errorResponse, true),
    zValidator("query", listAgentsSchema.query),
    async (c) => {
      try {
        const userId = c.get("user_id");
        const { name, language, page, limit } = c.req.valid("query");

        const agents = await agentModels.listAgent({
          userId,
          name,
          language,
          page,
          limit,
        });

        const currentPage = page;
        const totalPages = Math.ceil(agents.length / limit);

        return c.json({ data: toSnakeCase(agents), current_page: currentPage, total_pages: totalPages });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to get agents" }, 500);
      }
    }
  )
  .get("/:id", createDescription(["Agents"], "Get an agent data", getAgentSchema.successResponse, getAgentSchema.errorResponse, true), async (c) => {
    try {
      const { id } = c.req.param();
      const userId = c.get("user_id");

      const agentDB = await agentModels.getAgentById(id, userId);

      if (!agentDB) {
        return c.json({ error: "Agent not found" }, 404);
      }

      const elevenApiClient = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY || "",
      });

      const agent = await elevenApiClient.conversationalAi.getAgent(id);

      return c.json({ data: agent });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get agent" }, 500);
    }
  })
  .patch(
    "/:id",
    createDescription(["Agents"], "Update an agent data", updateAgentSchema.successResponse, updateAgentSchema.errorResponse, true),
    zValidator("json", updateAgentSchema.requestBody),
    async (c) => {
      try {
        const { name, conversation_config, platform_settings } = c.req.valid("json");
        const { id } = c.req.param();
        const userId = c.get("user_id");

        const agentDB = await agentModels.getAgentById(id, userId);

        if (!agentDB) {
          return c.json({ error: "Agent not found" }, 404);
        }

        const elevenApiClient = new ElevenLabsClient({
          apiKey: process.env.ELEVENLABS_API_KEY || "",
        });

        const agent = await elevenApiClient.conversationalAi.updateAgent(id, {
          name,
          conversation_config,
          platform_settings,
        });

        await agentModels.updateAgent(id, userId, {
          name,
          language: conversation_config.agent.language,
          avatar: platform_settings?.widget?.avatar?.url,
        });

        return c.json({ data: agent });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to get agent" }, 500);
      }
    }
  )
  .delete("/:id", createDescription(["Agents"], "Delete an agent", deleteAgentSchema.successResponse, deleteAgentSchema.errorResponse, true), async (c) => {
    try {
      const { id } = c.req.param();
      const userId = c.get("user_id");

      const isAgentExists = await agentModels.getAgentById(id, userId);

      if (!isAgentExists) {
        return c.json({ error: "Agent not found" }, 404);
      }

      const elevenApiClient = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY || "",
      });

      await elevenApiClient.conversationalAi.deleteAgent(id);

      await agentModels.deleteAgent(id, userId);

      return c.json({ data: "Agent deleted" });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to delete agent" }, 500);
    }
  });

export default agents;
