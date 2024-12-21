import { server } from "..";
import messageModels from "../models/message";
import { Queue, Worker } from "bullmq";
import openai from "../utils/openai";
import agentModels from "../models/agent";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const chatMessagesTopic = "chat-messages";
const agentStatusTopic = "agent-status";

const queue = new Queue<{ messageId: string; userId: string }>("incoming-message", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

const worker = new Worker<{ messageId: string; userId: string }>(
  "incoming-message",
  async (job) => {
    if (job.name === "process-message") {
      const { messageId, userId } = job.data;

      const message = await messageModels.updateMessage(messageId, {
        status: "READ",
      });

      server.publish(chatMessagesTopic, JSON.stringify({ eventName: chatMessagesTopic, data: message }));

      const agent = await agentModels.getAgentById(message.agentId, userId);

      if (!agent || !agent.prompt) {
        return;
      }

      await agentModels.updateAgent(message.agentId, userId, { status: "PROCESSING" });

      server.publish(agentStatusTopic, JSON.stringify({ eventName: agentStatusTopic, agentId: message.agentId, status: "PROCESSING" }));

      const prevMessages = await messageModels.listMessages({ agentId: message.agentId, order: "desc", page: 1, limit: 10 });

      const messages = [
        { role: "system", content: agent.prompt },
        ...prevMessages.reverse().map((msg) => ({
          role: msg.from === "USER" ? "user" : "assistant",
          content: msg.body,
        })),
      ] as ChatCompletionMessageParam[];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      const resMessage = await messageModels.createMessage({
        agentId: message.agentId,
        body: completion.choices[0].message.content || "",
        from: "agent",
      });

      await agentModels.updateAgent(message.agentId, userId, { status: "IDLE" });

      server.publish(agentStatusTopic, JSON.stringify({ eventName: agentStatusTopic, agentId: message.agentId, status: "IDLE" }));
      server.publish(chatMessagesTopic, JSON.stringify({ eventName: chatMessagesTopic, data: resMessage }));
    }
  },
  {
    connection: {
      host: "redis",
      port: 6379,
      maxRetriesPerRequest: null,
    },
  }
);

worker.on("progress", (job, progress) => {
  console.log(`Job ${job?.id} with ${job?.data.messageId} is ${progress}% complete`);
});

worker.on("completed", (job) => {
  console.log(`Job ${job?.id} with ${job?.data.messageId} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} with ${job?.data.messageId} failed with error: ${err}`);
});

export { queue };
