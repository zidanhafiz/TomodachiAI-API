import { z } from "zod";

const messageSchema = z.object({
  id: z.string().openapi({ example: "123" }),
  body: z.string().openapi({ example: "Hello, how can I help you today?" }),
  from: z.enum(["user", "agent"]).openapi({ example: "user" }),
  status: z.enum(["sent", "read", "error"]).openapi({ example: "sent" }),
  created_at: z.string().openapi({ example: "2024-01-01" }),
  updated_at: z.string().openapi({ example: "2024-01-01" }),
});

export const listMessagesSchema = {
  query: z.object({
    order: z.enum(["asc", "desc"]).optional().default("desc").openapi({ example: "desc" }),
    page: z.coerce.number().optional().default(1).openapi({ example: 1 }),
    limit: z.coerce.number().optional().default(30).openapi({ example: 30 }),
  }),
  successResponse: z.object({
    data: z.object({
      messages: z.array(messageSchema),
    }),
    current_page: z.number().openapi({ example: 1 }),
    total_pages: z.number().openapi({ example: 10 }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to list messages" }),
  }),
};

export const createMessageSchema = {
  requestBody: z.object({
    body: z.string().min(1).max(1000).openapi({ example: "Hello, how can I help you today?" }),
  }),
  successResponse: z.object({
    data: z.string().openapi({ example: "Message sent" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to create message" }),
  }),
};

export const getMessageById = {
  successResponse: z.object({
    data: messageSchema,
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to get message" }),
  }),
};

export const deleteMessage = {
  successResponse: z.object({
    data: z.string().openapi({ example: "Success delete message <messageId>" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to delete message" }),
  }),
};

export const markAsReadSchema = {
  successResponse: z.object({
    data: z.string().openapi({ example: "Success marked message <messageId> as READ" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to mark message as read" }),
  }),
};

export const clearAllMessages = {
  successResponse: z.object({
    data: z.string().openapi({ example: "Success clear all messages on Agent ID: 123" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to clear all messages" }),
  }),
};
