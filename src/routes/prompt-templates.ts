import { Hono } from "hono";
import { zValidator } from "../middlewares/validator";
import { createSystemPrompt, createSystemPromptTemplate } from "../utils/promptUtils";
import { createPromptTemplatesSchema } from "../utils/schemas/agentSchemas";
import { createDescription } from "../utils/openApiUtils";

const promptTemplates = new Hono<{
  Variables: {
    user_id: string;
  };
}>().post(
  "/",
  createDescription(
    ["Prompt Templates"],
    "Create prompt templates",
    createPromptTemplatesSchema.successResponse,
    createPromptTemplatesSchema.errorResponse,
    true
  ),
  zValidator("json", createPromptTemplatesSchema.requestBody),
  async (c) => {
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
  }
);

export default promptTemplates;
