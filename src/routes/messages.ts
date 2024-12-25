import { Hono } from "hono";
import { Agent } from "@prisma/client";
import { createDescription } from "../utils/openApiUtils";
import { zValidator } from "../middlewares/validator";
import { clearAllMessages, createMessageSchema, deleteMessage, getMessageById, listMessagesSchema, markAsReadSchema } from "../utils/schemas/messageSchema";
import { verifyUserAgent } from "../middlewares/agents";
import messageModels from "../models/message";
import { toSnakeCase } from "../utils/snakeCaseFormat";
import { messageQueue } from "../workers/processMessage";
import { server } from "..";

const chatMessagesTopic = "chat-messages";

const messages = new Hono<{
  Variables: {
    user_id: string;
    agent: Agent;
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
        const agent = c.get("agent");
        const { order, page, limit } = c.req.valid("query");

        const messages = await messageModels.listMessages({ agentId: agent.id, order, page, limit });

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
        const agent = c.get("agent");
        const { body } = c.req.valid("json");

        if (agent.status === "PROCESSING") {
          return c.json({ error: "Agent is already processing" }, 400);
        }

        const message = await messageModels.createMessage({ agentId: agent.id, body, from: "user" });

        await messageQueue.add(
          "process-message",
          {
            agentId: agent.id,
            messageId: message.id,
            userId,
          },
          {
            delay: 5000,
            removeOnComplete: {
              age: 600, // keep up to 10 minutes
              count: 100, // keep up to 100 jobs
            },
            removeOnFail: {
              age: 3600, // keep up to 1 hour
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
  )
  .delete(
    "/clear-messages",
    createDescription(["Messages"], "Clear all messages", clearAllMessages.successResponse, clearAllMessages.errorResponse, true),
    async (c) => {
      try {
        const agent = c.get("agent");

        if (agent.status === "PROCESSING") {
          return c.json({ error: "Agent is already processing" }, 400);
        }

        const messages = await messageModels.listMessages({ agentId: agent.id, order: "desc", page: 1, limit: 10 });

        if (messages.length === 0) {
          return c.json({ error: "Agent's chat is empty" }, 400);
        }

        await messageModels.clearAllMessages(agent.id);

        return c.json({ data: `Success clear all messages on Agent ID: ${agent.id}` });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to clear all messages" }, 500);
      }
    }
  )
  .get("/:messageId", createDescription(["Messages"], "Get message", getMessageById.successResponse, getMessageById.errorResponse, true), async (c) => {
    try {
      const agent = c.get("agent");
      const messageId = c.req.param("messageId");

      if (!messageId) {
        return c.json({ error: "Message ID is required" }, 400);
      }

      const message = await messageModels.getMessageById(messageId, agent.id);

      if (!message) {
        return c.json({ error: "Message not found" }, 404);
      }

      return c.json({ data: message });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get message" }, 500);
    }
  })
  .delete("/:messageId", createDescription(["Messages"], "Delete message", deleteMessage.successResponse, deleteMessage.errorResponse, true), async (c) => {
    try {
      const agent = c.get("agent");
      const messageId = c.req.param("messageId");

      if (agent.status === "PROCESSING") {
        return c.json({ error: "Agent is already processing" }, 400);
      }

      if (!messageId) {
        return c.json({ error: "Message ID is required" }, 400);
      }

      const message = await messageModels.getMessageById(messageId, agent.id);

      if (!message) {
        return c.json({ error: "Message not found" }, 404);
      }

      await messageModels.deleteMessage(messageId, agent.id);

      return c.json({ data: `Success delete message ${messageId}` });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to delete message" }, 500);
    }
  })
  .post(
    "/:messageId/mark-as-read",
    createDescription(["Messages"], "Mark a message as read", markAsReadSchema.successResponse, markAsReadSchema.errorResponse, true),
    async (c) => {
      try {
        const agent = c.get("agent");
        const messageId = c.req.param("messageId");

        if (agent.status === "PROCESSING") {
          return c.json({ error: "Agent is already processing" }, 400);
        }

        if (!messageId) {
          return c.json({ error: "Message ID is required" }, 400);
        }

        const message = await messageModels.getMessageById(messageId, agent.id);

        if (!message) {
          return c.json({ error: "Message not found" }, 404);
        }

        await messageModels.updateMessage(messageId, { status: "READ" });

        return c.json({ data: `Success marked message ${messageId} as READ` });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to marked message as READ" }, 500);
      }
    }
  );

export default messages;
