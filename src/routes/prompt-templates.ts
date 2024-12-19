import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import { createSystemPrompt, createSystemPromptTemplate } from "../utils/promptUtils";
import { createPromptTemplatesSchema } from "../utils/schemas/agentSchemas";

const promptTemplates = new Hono<{
  Variables: {
    user_id: string;
  };
}>().post("/", zValidator("json", createPromptTemplatesSchema.requestBody), async (c) => {
  try {
    const { role, name, template, personality } = c.req.valid("json");

    let promptTemplates;
    if (template === "custom") {
      promptTemplates = createSystemPrompt(name, personality, role);
    } else {
      promptTemplates = createSystemPromptTemplate(name, role.toUpperCase());
    }

    return c.json({ data: promptTemplates });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to get prompt templates" }, 500);
  }
});

export default promptTemplates;
