import { Message } from "@prisma/client";
import prisma from "../utils/prisma";

const listMessages = async ({ agentId, order, page, limit }: { agentId: string; order: "asc" | "desc"; page: number; limit: number }) => {
  try {
    const messages = await prisma.message.findMany({
      where: { agentId },
      orderBy: {
        createdAt: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return messages;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createMessage = async ({ agentId, body, from }: { agentId: string; body: string; from: "user" | "agent" }) => {
  try {
    const message = await prisma.message.create({ data: { agentId, body, from: from === "user" ? "USER" : "AGENT", status: "SENT" } });
    return message;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateMessage = async (id: string, messageData: Partial<Message>) => {
  try {
    const message = await prisma.message.update({ where: { id }, data: messageData });
    return message;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getMessageById = async (id: string, agentId: string) => {
  try {
    const message = await prisma.message.findUnique({ where: { id, agentId } });
    return message;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteMessage = async (id: string, agentId: string) => {
  try {
    const message = await prisma.message.delete({ where: { id, agentId } });
    return message;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const clearAllMessages = async (agentId: string) => {
  try {
    await prisma.message.deleteMany({ where: { agentId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const messageModels = {
  listMessages,
  createMessage,
  updateMessage,
  getMessageById,
  deleteMessage,
  clearAllMessages,
};

export default messageModels;
