import { z } from "zod";

export const convertTextToSpeechSchema = {
  requestBody: z.object({
    agent_id: z.string().openapi({ example: "123" }),
    text: z.string().openapi({ example: "Hello, how are you?" }),
  }),
  successResponse: z.instanceof(File).openapi({ format: "file" }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to get TTS" }) }),
};
