import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(3).max(20),
  conversation_config: z.object({
    agent: z.object({
      prompt: z.object({
        prompt: z.string().min(3).max(500),
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
          .default("gpt-4o-mini"),
      }),
      first_message: z.string().min(3).max(500),
      language: z.string().max(20).default("en"),
    }),
    tts: z.object({
      model_id: z.enum(["eleven_turbo_v2", "eleven_turbo_v2_5"]).default("eleven_turbo_v2"),
      voice_id: z.string().min(3).max(20),
    }),
  }),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;
