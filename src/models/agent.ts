import { Agent } from "../types/agent";
import prisma from "../utils/prisma";

export const getAgentById = async (id: string, userId: string) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id, userId },
    });

    return agent;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get agent");
  }
};

export const createAgent = async (agent: Agent) => {
  try {
    const agentDB = await prisma.agent.create({
      data: {
        userId: agent.userId,
        name: agent.name,
        language: agent.language,
        id: agent.id,
      },
    });

    return agentDB;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create agent");
  }
};

const agentModels = {
  getAgentById,
  createAgent,
};

export default agentModels;
