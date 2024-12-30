import { server } from "..";
import messageModels from "../models/message";
import { Queue, Worker } from "bullmq";
import openai from "../utils/openai";
import agentModels from "../models/agent";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Message } from "@prisma/client";

const chatMessagesTopic = "chat-messages";
const agentStatusTopic = "agent-status";

type ProcessMessageData = {
  agentId: string;
  messageId: string;
  userId: string;
};

const messageQueue = new Queue<ProcessMessageData>("incoming-message", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

const worker = new Worker<ProcessMessageData, Message | null>(
  "incoming-message",
  async (job) => {
    if (job.name === "process-message") {
      const { messageId, userId, agentId } = job.data;

      const message = await messageModels.updateMessage(messageId, { status: "READ" });
      const agent = await agentModels.updateAgent(agentId, userId, { status: "PROCESSING" });

      server.publish(`${chatMessagesTopic}-${userId}`, JSON.stringify({ eventName: chatMessagesTopic, data: message }));
      server.publish(`${agentStatusTopic}-${userId}`, JSON.stringify({ eventName: agentStatusTopic, agentId, status: "PROCESSING" }));

      const prevMessages = await messageModels.listMessages({ agentId: message.agentId, order: "desc", page: 1, limit: 10 });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const messages = [
        { role: "developer", content: agent.prompt },
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

      return resMessage;
    }
    return null;
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    },
    removeOnComplete: {
      age: 600, // keep up to 10 minutes
      count: 100, // keep up to 100 jobs
    },
    removeOnFail: {
      age: 3600, // keep up to 1 hou
    },
  }
);

worker.on("progress", (job, progress) => {
  if (job.name === "process-message") {
    console.log(`Job ${job?.id} with ${job?.data.messageId} is ${progress}% complete`);
  }
});

worker.on("completed", async (job, result) => {
  if (job.name === "process-message") {
    console.log(`Job ${job?.id} with ${job?.data.messageId} completed`);

    await agentModels.updateAgent(job.data.agentId, job.data.userId, { status: "IDLE" });

    server.publish(`${agentStatusTopic}-${job.data.userId}`, JSON.stringify({ eventName: agentStatusTopic, agentId: job.data.agentId, status: "IDLE" }));
    server.publish(`${chatMessagesTopic}-${job.data.userId}`, JSON.stringify({ eventName: chatMessagesTopic, data: result }));
  }
});

worker.on("failed", (job, err) => {
  if (job && job.name === "process-message") {
    console.log(`Job ${job?.id} with ${job?.data.messageId} failed with error: ${err}`);
  }
});

export { messageQueue };
