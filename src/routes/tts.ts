import { Hono } from "hono";
import { convertTextToSpeechSchema } from "../utils/schemas/ttsSchemas";
import { zValidator } from "../middlewares/validator";
import { createDescription } from "../utils/openApiUtils";
import agentModels from "../models/agent";
import { ElevenLabsClient } from "elevenlabs";

const tts = new Hono<{ Variables: { userId: string } }>().post(
  "/",
  createDescription(["TTS"], "Convert text to speech", convertTextToSpeechSchema.successResponse, convertTextToSpeechSchema.errorResponse, true),
  zValidator("json", convertTextToSpeechSchema.requestBody),
  async (c) => {
    try {
      const userId = c.get("userId");
      const { text, agent_id } = c.req.valid("json");

      const agent = await agentModels.getAgentById(agent_id, userId);

      if (!agent) {
        return c.json({ error: "Agent not found" }, 404);
      }

      const elevenLabsClient = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY || "",
      });

      const response = await elevenLabsClient.textToSpeech.convertAsStream(agent.voiceId, {
        output_format: "mp3_44100_64",
        text,
        model_id: "eleven_multilingual_v2",
      });

      const chunks: Buffer[] = [];

      for await (const chunk of response) {
        chunks.push(chunk);
      }

      const content = Buffer.concat(chunks);

      return new Response(content, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get TTS" }, 500);
    }
  }
);

export default tts;
