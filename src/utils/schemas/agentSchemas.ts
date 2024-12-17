import { z } from "zod";
import "zod-openapi/extend";

export const agentSchema = z.object({
  id: z.string().openapi({ example: "123" }),
  name: z.string().openapi({ example: "Lisa" }),
  language: z.string().openapi({ example: "en" }),
  avatar: z.string().optional().openapi({ example: "https://example.com/avatar.png" }),
  created_at: z.string().openapi({ example: "2024-01-01" }),
  updated_at: z.string().openapi({ example: "2024-01-01" }),
  user_id: z.string().openapi({ example: "123" }),
});

const basicConversationConfigSchema = z.object({
  agent: z.object({
    prompt: z.object({
      prompt: z.string().min(3).openapi({ example: "You are a helpful assistant" }),
      llm: z
        .enum([
          "gpt-4o-mini",
          "gpt-4o",
          "gpt-4",
          "gpt-4-turbo",
          "gpt-3.5-turbo",
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-1.0-pro",
          "claude-3-5-sonnet",
          "claude-3-haiku",
        ])
        .default("gpt-4o-mini")
        .openapi({ example: "gpt-4o-mini" }),
    }),
    temperature: z.number().min(0).max(1).default(0.5).openapi({ example: 0.5 }),
    first_message: z.string().min(3).max(1000).openapi({ example: "Hello, how can I help you today?" }),
    language: z.string().max(20).default("en").openapi({ example: "en" }),
  }),
  tts: z.object({
    model_id: z.enum(["eleven_turbo_v2", "eleven_turbo_v2_5"]).default("eleven_turbo_v2").openapi({ example: "eleven_turbo_v2" }),
    voice_id: z.string().min(3).max(20).openapi({ example: "21m00Tcm4TlvDq8ikWAM" }),
  }),
});

const advancedConversationConfigSchema = z.object({
  agent: z.object({
    prompt: z.object({
      prompt: z.string().min(3).openapi({ example: "You are a helpful assistant" }),
      llm: z
        .enum([
          "gpt-4o-mini",
          "gpt-4o",
          "gpt-4",
          "gpt-4-turbo",
          "gpt-3.5-turbo",
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-1.0-pro",
          "claude-3-5-sonnet",
          "claude-3-haiku",
        ])
        .default("gpt-4o-mini")
        .openapi({ example: "gpt-4o-mini" }),
      temperature: z.number().min(0).max(1).default(0.5).openapi({ example: 0.5 }),
      knowledge_base: z
        .object({
          type: z.enum(["file", "url"]).optional().openapi({ example: "file" }),
          name: z.string().optional().openapi({ example: "knowledge-base.pdf" }),
          id: z.string().optional().openapi({ example: "123" }),
        })
        .optional(),
    }),
    first_message: z.string().min(3).max(1000).openapi({ example: "Hello, how can I help you today?" }),
    language: z.string().max(20).default("en").openapi({ example: "en" }),
  }),
  tts: z
    .object({
      model_id: z.enum(["eleven_turbo_v2", "eleven_turbo_v2_5"]).default("eleven_turbo_v2").openapi({ example: "eleven_turbo_v2" }),
      voice_id: z.string().min(3).max(20).openapi({ example: "21m00Tcm4TlvDq8ikWAM" }),
    })
    .optional(),
  conversation: z
    .object({
      max_duration: z.number().min(300).max(1800).default(600).openapi({ example: 600 }),
    })
    .optional(),
});

const widgetConfigSchema = z.object({
  avatar: z.object({
    type: z.enum(["image", "url"]).optional().default("image").openapi({ example: "image" }),
    url: z.string().optional().openapi({ example: "https://example.com/avatar.png" }),
  }),
});

export const createAgentSchema = {
  requestBody: z.object({
    name: z.string().min(3).max(20).openapi({ example: "Lisa" }),
    conversation_config: basicConversationConfigSchema,
  }),
  successResponse: z.object({
    data: agentSchema,
  }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to create agent" }) }),
};

export const listAgentsSchema = {
  query: z.object({
    name: z.string().optional().openapi({ example: "Lisa" }),
    language: z.string().optional().openapi({ example: "en" }),
    page: z.coerce.number().optional().default(1).openapi({ example: 1 }),
    limit: z.coerce.number().optional().default(10).openapi({ example: 10 }),
  }),
  successResponse: z.object({
    data: z.object({
      data: z.array(agentSchema),
      current_page: z.number().openapi({ example: 1 }),
      total_pages: z.number().openapi({ example: 10 }),
    }),
  }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to list agents" }) }),
};

export const getAgentSchema = {
  successResponse: z.object({
    data: z.object({
      name: z.string().openapi({ example: "Lisa" }),
      conversation_config: basicConversationConfigSchema,
    }),
  }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to get agent" }) }),
};

export const updateAgentSchema = {
  requestBody: z.object({
    name: z.string().min(3).max(20).openapi({ example: "Lisa" }),
    conversation_config: advancedConversationConfigSchema,
    platform_settings: z
      .object({
        widget: widgetConfigSchema,
      })
      .optional(),
  }),
  successResponse: z.object({
    data: z.object({
      name: z.string().openapi({ example: "Lisa" }),
      conversation_config: advancedConversationConfigSchema,
      platform_settings: z.object({
        widget: widgetConfigSchema,
      }),
    }),
  }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to update agent" }) }),
};

export const deleteAgentSchema = {
  successResponse: z.object({ data: z.string().openapi({ example: "Agent deleted" }) }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to delete agent" }) }),
};
