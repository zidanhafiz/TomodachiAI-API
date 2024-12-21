import { Hono } from "hono";

import { createDescription } from "../utils/openApiUtils";
import { zValidator } from "../middlewares/validator";
import { createMessageSchema, listMessagesSchema } from "../utils/schemas/messageSchema";
import { verifyUserAgent } from "../middlewares/agents";
import messageModels from "../models/message";
import { toSnakeCase } from "../utils/snakeCaseFormat";
import { queue } from "../workers/processMessage";
import { server } from "..";
import agentModels from "../models/agent";

const chatMessagesTopic = "chat-messages";

const messages = new Hono<{
  Variables: {
    user_id: string;
  };
}>()
  .basePath("/:agentId/messages")
  .use(verifyUserAgent)
  .get(
    "/",
    createDescription(["Messages"], "List messages for an agent", listMessagesSchema.successResponse, listMessagesSchema.errorResponse, true),
    zValidator("query", listMessagesSchema.query),
    async (c) => {
      try {
        const { agentId } = c.req.param();
        const { order, page, limit } = c.req.valid("query");

        const messages = await messageModels.listMessages({ agentId, order, page, limit });

        const currentPage = page;
        const totalPages = Math.ceil(messages.length / limit);

        return c.json({ data: toSnakeCase(messages), current_page: currentPage, total_pages: totalPages });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to get messages" }, 500);
      }
    }
  )
  .post(
    "/",
    createDescription(["Messages"], "Create a message for an agent", createMessageSchema.successResponse, createMessageSchema.errorResponse, true),
    zValidator("json", createMessageSchema.requestBody),
    async (c) => {
      try {
        const userId = c.get("user_id");
        const { agentId } = c.req.param();
        const { body } = c.req.valid("json");

        const agent = await agentModels.getAgentById(agentId, userId);

        if (!agent) {
          return c.json({ error: "Agent not found" }, 404);
        }

        if (agent.status === "PROCESSING") {
          return c.json({ error: "Agent is already processing" }, 400);
        }

        const message = await messageModels.createMessage({ agentId, body, from: "user" });

        await queue.add(
          "process-message",
          {
            messageId: message.id,
            userId,
          },
          {
            removeOnComplete: {
              age: 3600, // keep up to 1 hour
              count: 1000, // keep up to 1000 jobs
            },
            removeOnFail: {
              age: 24 * 3600, // keep up to 24 hours
            },
          }
        );

        server.publish(chatMessagesTopic, JSON.stringify({ eventName: chatMessagesTopic, data: message }));

        return c.json({ data: "Message sent" });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to create message" }, 500);
      }
    }
  );

export default messages;
