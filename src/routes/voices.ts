import { Hono } from "hono";
import { getVoiceSchema, listVoicesSchema } from "../utils/schemas/voiceSchemas";
import { createDescription } from "../utils/openApiUtils";
import { zValidator } from "../middlewares/validator";
import { ElevenLabsClient } from "elevenlabs";

const voices = new Hono()
  .get(
    "/",
    createDescription(["Voices"], "List voices", listVoicesSchema.successResponse, listVoicesSchema.errorResponse, true),
    zValidator("query", listVoicesSchema.query),
    async (c) => {
      try {
        const { page, limit } = c.req.valid("query");
        const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
        const res = await elevenLabsClient.voices.getAll();

        const paginatedVoices = res.voices.slice((page - 1) * limit, page * limit);

        const currentPage = page;
        const totalPages = Math.ceil(res.voices.length / limit);

        return c.json({ data: paginatedVoices, current_page: currentPage, total_pages: totalPages });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to fetch voices" }, 500);
      }
    }
  )
  .get(
    "/:id",
    createDescription(["Voices"], "Get voice", getVoiceSchema.successResponse, getVoiceSchema.errorResponse, true),
    zValidator("param", getVoiceSchema.params),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

        const res = await elevenLabsClient.voices.get(id);

        return c.json({ data: res });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to get voice" }, 500);
      }
    }
  );

export default voices;
