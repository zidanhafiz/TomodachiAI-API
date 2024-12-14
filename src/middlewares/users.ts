import { createMiddleware } from "hono/factory";

const verifyUser = createMiddleware<{
  Variables: {
    user_id: string;
    user_role: string;
  };
}>(async (c, next) => {
  const id = c.req.param("id");
  const userId = c.get("user_id");
  const userRole = c.get("user_role");

  if (!id) {
    return c.json({ error: "User ID is required" }, 400);
  }

  if (userRole === "ADMIN") {
    await next();
    return;
  }

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (userId !== id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

export { verifyUser };
