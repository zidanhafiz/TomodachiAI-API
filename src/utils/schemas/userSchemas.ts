import { z } from "zod";
import "zod-openapi/extend";

export const signupSchema = {
  requestBody: z.object({
    email: z.string().email().openapi({ example: "john.doe@example.com" }),
    first_name: z.string().min(3).max(20).openapi({ example: "John" }),
    last_name: z.string().min(0).max(20).openapi({ example: "Doe" }),
    password: z.string().min(8).max(20).openapi({ example: "password123" }),
  }),
  successResponse: z.object({
    data: z.string().openapi({ example: "Successfully registered user" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to register user" }),
  }),
};

export const loginSchema = {
  requestBody: z.object({
    email: z.string().email().openapi({ example: "john.doe@example.com" }),
    password: z.string().min(8).max(20).openapi({ example: "password123" }),
  }),
  successResponse: z.object({
    data: z.object({
      access_token: z.string().openapi({ example: "access_token" }),
      refresh_token: z.string().openapi({ example: "refresh_token" }),
    }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to login" }),
  }),
};

export const refreshTokenSchema = {
  requestBody: z.object({
    refresh_token: z.string().min(5).openapi({ example: "refresh_token" }),
  }),
  successResponse: z.object({
    data: z.object({
      access_token: z.string().openapi({ example: "access_token" }),
    }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to refresh token" }),
  }),
};

export const idParamSchema = z.object({ id: z.string().openapi({ example: "123" }) });

export const userSchema = z.object({
  id: z.string().openapi({ example: "123" }),
  email: z.string().openapi({ example: "john.doe@example.com" }),
  first_name: z.string().openapi({ example: "John" }),
  last_name: z.string().openapi({ example: "Doe" }),
  role: z.string().openapi({ example: "ADMIN" }),
  credits: z.number().openapi({ example: 100 }),
  refresh_token: z.string().optional().openapi({ example: "refresh_token" }),
  is_verified: z.boolean().openapi({ example: true }),
  created_at: z.string().openapi({ example: "2024-01-01" }),
  updated_at: z.string().openapi({ example: "2024-01-01" }),
});

export const updateUserSchema = {
  requestBody: z.object({
    first_name: z.string().min(3).max(20).openapi({ example: "John" }),
    last_name: z.string().min(0).max(20).openapi({ example: "Doe" }),
  }),
  successResponse: z.object({
    data: z.string().openapi({ example: "Successfully updated user" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to update user" }),
  }),
};

export const listUsersSchema = {
  query: z.object({
    name: z.string().optional().openapi({ example: "John" }),
    email: z.string().optional().openapi({ example: "john.doe@example.com" }),
    role: z.string().optional().openapi({ example: "ADMIN" }),
    page: z.coerce.number().optional().openapi({ example: 1 }),
    limit: z.coerce.number().optional().openapi({ example: 10 }),
  }),
  successResponse: z.object({
    data: z.object({
      data: z.array(userSchema),
      current_page: z.number().openapi({ example: 1 }),
      total_pages: z.number().openapi({ example: 10 }),
    }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to list users" }),
  }),
};

export const deleteUserSchema = {
  successResponse: z.object({
    data: z.string().openapi({ example: "Successfully deleted user" }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to delete user" }),
  }),
};

export const getUserSchema = {
  successResponse: z.object({
    data: userSchema,
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to get user" }),
  }),
};

export const addCreditsSchema = {
  requestBody: z.object({
    credits: z.number().min(1).positive().openapi({ example: 100 }),
  }),
  successResponse: z.object({
    data: z.object({
      previous_credits: z.number().openapi({ example: 100 }),
      new_credits: z.number().openapi({ example: 200 }),
    }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to add credits" }),
  }),
};

export const deductCreditsSchema = {
  requestBody: z.object({
    credits: z.number().min(1).positive().openapi({ example: 100 }),
  }),
  successResponse: z.object({
    data: z.object({
      previous_credits: z.number().openapi({ example: 100 }),
      new_credits: z.number().openapi({ example: 0 }),
    }),
  }),
  errorResponse: z.object({
    error: z.string().openapi({ example: "Failed to deduct credits" }),
  }),
};
