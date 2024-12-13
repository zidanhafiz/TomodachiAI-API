import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import userModels from "../models/user";

const idParamSchema = z.object({ id: z.string() });
const updateUserSchema = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(0).max(20),
});
const listUsersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const users = new Hono<{
  Variables: {
    user_id: string;
    user_role: string;
  };
}>()
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const { id } = c.req.valid("param");

      const user = await userModels.getUserById(id);

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data: user });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get user" }, 500);
    }
  })
  .patch("/:id", zValidator("param", idParamSchema), zValidator("json", updateUserSchema), async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { firstName, lastName } = c.req.valid("json");

      await userModels.updateUser(id, { firstName, lastName });

      return c.json({ data: "Successfully updated user" });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  })
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    try {
      const { id } = c.req.valid("param");

      await userModels.deleteUser(id);

      return c.json({ data: "Successfully deleted user" });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  })
  .get("/", zValidator("query", listUsersSchema), async (c) => {
    try {
      const userRole = c.get("user_role");

      if (userRole !== "admin") {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { name, email, role, page, limit } = c.req.valid("query");

      const users = await userModels.listUsers({ name, email, role, page, limit });

      const currentPage = page || 1;
      const totalPages = limit ? Math.ceil(users.length / limit) : 1;

      return c.json({ data: users, currentPage, totalPages });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to get users" }, 500);
    }
  });

export default users;
