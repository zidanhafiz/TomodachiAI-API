import { Hono } from "hono";
import { ElevenLabsClient } from "elevenlabs";

import { zValidator } from "../middlewares/validator";
import agentModels from "../models/agent";
import {
  addAvatarSchema,
  addKnowledgeSchema,
  createAgentSchema,
  deleteAgentSchema,
  getAgentSchema,
  listAgentsSchema,
  updateAgentSchema,
} from "../utils/schemas/agentSchemas";
import { createDescription } from "../utils/openApiUtils";
import { toSnakeCase } from "../utils/snakeCaseFormat";
import { deductCredits } from "../utils/userUtils";
import { ZodError } from "zod";
import { formatZodError } from "../utils/zodErrorUtils";

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
        const { name, conversation_config, role, personality } = c.req.valid("json");
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
          prompt: conversation_config.agent.prompt.prompt,
          userId,
          role: role || "FRIEND",
          personality: personality || [],
          voiceId: conversation_config.tts.voice_id,
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

      return c.json({ data: { ...agent, avatar: agentDB.avatar } });
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
        const { name, conversation_config, role, personality } = c.req.valid("json");
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
        });

        const data = {
          name,
          language: conversation_config.agent.language,
          role: role,
          personality: personality,
          prompt: conversation_config.agent.prompt.prompt,
          voiceId: conversation_config.tts.voice_id,
        };

        await agentModels.updateAgent(id, userId, data);

        return c.json({ data: { ...agent, avatar: agentDB.avatar } });
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
  })
  .post(
    "/:id/knowledge",
    createDescription(["Agent Knowledge"], "Add knowledge to an agent", addKnowledgeSchema.successResponse, addKnowledgeSchema.errorResponse, true),
    zValidator("form", addKnowledgeSchema.requestBody),
    async (c) => {
      try {
        const { url, file } = c.req.valid("form");
        const { id } = c.req.param();
        const userId = c.get("user_id");

        const agentDB = await agentModels.getAgentById(id, userId);

        if (!agentDB) {
          return c.json({ error: "Agent not found" }, 404);
        }

        const elevenApiClient = new ElevenLabsClient({
          apiKey: process.env.ELEVENLABS_API_KEY || "",
        });

        const knowledgeBase = await elevenApiClient.conversationalAi.addToAgentKnowledgeBase(id, {
          url,
          file,
        });

        const agent = await elevenApiClient.conversationalAi.updateAgent(id, {
          conversation_config: {
            agent: {
              prompt: {
                knowledge_base: [
                  {
                    type: file ? "file" : "url",
                    name: file ? file.name : url,
                    id: knowledgeBase.id,
                  },
                ],
              },
            },
          },
        });

        return c.json({ data: { ...agent, avatar: agentDB.avatar } });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to add knowledge" }, 500);
      }
    }
  )
  .post(
    "/:id/avatar",
    createDescription(["Agent Avatar"], "Add Avatar to an agent", addAvatarSchema.successResponse, addAvatarSchema.errorResponse, true),
    zValidator("form", addAvatarSchema.requestBody),
    async (c) => {
      try {
        const { file } = c.req.valid("form");
        const { id } = c.req.param();
        const userId = c.get("user_id");

        const agentDB = await agentModels.getAgentById(id, userId);

        if (!agentDB) {
          return c.json({ error: "Agent not found" }, 404);
        }

        const elevenApiClient = new ElevenLabsClient({
          apiKey: process.env.ELEVENLABS_API_KEY || "",
        });

        const avatar = await elevenApiClient.conversationalAi.postAgentAvatar(id, {
          avatar_file: file,
        });

        const agent = await elevenApiClient.conversationalAi.updateAgent(id, {
          platform_settings: {
            widget: {
              avatar: {
                type: "image",
                url: avatar.avatar_url,
              },
            },
          },
        });

        await agentModels.updateAgent(id, userId, {
          avatar: avatar.avatar_url,
        });

        return c.json({ data: { ...agent, avatar: avatar.avatar_url } });
      } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
          return c.json({ error: formatZodError(error) }, 400);
        }

        return c.json({ error: "Failed to add avatar" }, 500);
      }
    }
  );

export default agents;
