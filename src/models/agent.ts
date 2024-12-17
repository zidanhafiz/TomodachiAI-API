import { Prisma } from "@prisma/client";
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

export const listAgent = async ({ userId, name, language, page, limit }: { userId: string; name?: string; language?: string; page: number; limit: number }) => {
  try {
    const filter = {} as Prisma.AgentWhereInput;

    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }

    if (language) {
      filter.language = language;
    }

    if (Object.keys(filter).length === 0) {
      const agents = await prisma.agent.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
      });

      return agents;
    }

    const agents = await prisma.agent.findMany({
      where: {
        ...filter,
        userId,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return agents;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to list agents");
  }
};

export const updateAgent = async (id: string, userId: string, agent: Partial<Agent>) => {
  try {
    const agentDB = await prisma.agent.update({ where: { id, userId }, data: agent });
    return agentDB;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update agent");
  }
};

export const deleteAgent = async (id: string, userId: string) => {
  try {
    const agent = await prisma.agent.delete({ where: { id, userId } });
    return agent;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete agent");
  }
};

const agentModels = {
  getAgentById,
  createAgent,
  listAgent,
  updateAgent,
  deleteAgent,
};

export default agentModels;
