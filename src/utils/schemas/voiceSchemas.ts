import { z } from "zod";
import "zod-openapi/extend";

const voiceSchema = z.object({
  voice_id: z.string().openapi({ example: "21m00Tcm4TlvDq8ikWAM" }),
  name: z.string().openapi({ example: "Rachel" }),
  category: z.string().openapi({ example: "premade" }),
  fine_tuning: z.object({
    is_allowed_to_fine_tune: z.boolean().openapi({ example: false }),
    verification_failures: z.array(z.string()).openapi({ example: [] }),
    verification_attempts_count: z.number().openapi({ example: 0 }),
    manual_verification_requested: z.boolean().openapi({ example: false }),
    finetuning_state: z.string().openapi({ example: "not_started" }),
  }),
  labels: z.object({
    accent: z.string().openapi({ example: "american" }),
    description: z.string().openapi({ example: "calm" }),
    age: z.string().openapi({ example: "young" }),
    gender: z.string().openapi({ example: "female" }),
    use_case: z.string().openapi({ example: "narration" }),
  }),
  preview_url: z
    .string()
    .openapi({ example: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-5c96-470d-8312-aab3b3d8f50a.mp3" }),
  available_for_tiers: z.array(z.string()).openapi({ example: [] }),
  high_quality_base_model_ids: z.array(z.string()).openapi({ example: [] }),
  voice_verification: z.object({
    requires_verification: z.boolean().openapi({ example: false }),
    is_verified: z.boolean().openapi({ example: false }),
    verification_failures: z.array(z.string()).openapi({ example: [] }),
    verification_attempts_count: z.number().openapi({ example: 0 }),
  }),
});

export const listVoicesSchema = {
  query: z.object({
    page: z.coerce.number().optional().default(1).openapi({ example: 1 }),
    limit: z.coerce.number().optional().default(10).openapi({ example: 10 }),
  }),
  successResponse: z.object({
    data: z.array(voiceSchema),
    current_page: z.number().openapi({ example: 1 }),
    total_pages: z.number().openapi({ example: 10 }),
  }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to list voices" }) }),
};

export const getVoiceSchema = {
  params: z.object({
    id: z.string().openapi({ example: "21m00Tcm4TlvDq8ikWAM" }),
  }),
  successResponse: z.object({
    data: voiceSchema,
  }),
  errorResponse: z.object({ error: z.string().openapi({ example: "Failed to get voice" }) }),
};
