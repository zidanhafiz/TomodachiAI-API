import { Hono } from "hono";
import userModels from "../models/user";
import { toSnakeCase } from "../utils/snakeCaseFormat";
import { validator as zValidator } from "hono-openapi/zod";
import { addCreditsSchema, deleteUserSchema, getUserSchema, listUsersSchema, updateUserSchema } from "../utils/schemas/userSchemas";
import { createDescription } from "../utils/openApiUtils";

const users = new Hono<{
  Variables: {
    user_id: string;
    user_role: string;
  };
}>()
  .get("/:id", createDescription(["Users"], "Get user", getUserSchema.successResponse, getUserSchema.errorResponse, true), async (c) => {
    try {
      const { id } = c.req.param();

      const user = await userModels.getUserById(id);

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data: toSnakeCase(user) });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get user" }, 500);
    }
  })
  .patch(
    "/:id",
    createDescription(["Users"], "Update user data", updateUserSchema.successResponse, updateUserSchema.errorResponse, true),
    zValidator("json", updateUserSchema.requestBody),
    async (c) => {
      try {
        const { id } = c.req.param();
        const { first_name, last_name } = c.req.valid("json");

        const user = await userModels.updateUser(id, { firstName: first_name, lastName: last_name });

        return c.json({ data: toSnakeCase(user) });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to update user" }, 500);
      }
    }
  )
  .delete("/:id", createDescription(["Users"], "Delete user", deleteUserSchema.successResponse, deleteUserSchema.errorResponse, true), async (c) => {
    try {
      const { id } = c.req.param();

      await userModels.deleteUser(id);

      return c.json({ data: "Successfully deleted user" });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  })
  .get(
    "/",
    createDescription(["Users"], "List users", listUsersSchema.successResponse, listUsersSchema.errorResponse, true),
    zValidator("query", listUsersSchema.query),
    async (c) => {
      try {
        const userRole = c.get("user_role");

        if (userRole !== "ADMIN") {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const { name, email, role, page, limit } = c.req.valid("query");

        const users = await userModels.listUsers({ name, email, role: role as "ADMIN" | "USER" | undefined, page, limit });

        const currentPage = page || 1;
        const totalPages = limit ? Math.ceil(users.length / limit) : 1;

        return c.json({ data: toSnakeCase(users), current_page: currentPage, total_pages: totalPages });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to get users" }, 500);
      }
    }
  )
  .post(
    "/:id/credits/add",
    createDescription(["User Credits"], "Add credits to a user", addCreditsSchema.successResponse, addCreditsSchema.errorResponse, true),
    zValidator("json", addCreditsSchema.requestBody),
    async (c) => {
      try {
        const userId = c.get("user_id");
        const { credits } = c.req.valid("json");

        const user = await userModels.getUserById(userId);

        if (!user) {
          return c.json({ error: "User not found" }, 404);
        }

        const updatedUser = await userModels.updateUser(userId, {
          credits: user.credits + credits,
        });

        return c.json({ data: { previous_credits: user.credits, new_credits: updatedUser.credits } });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to add credits" }, 500);
      }
    }
  );

export default users;
