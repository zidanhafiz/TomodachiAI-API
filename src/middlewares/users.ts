import { createMiddleware } from "hono/factory";

const verifyUser = createMiddleware<{
  Variables: {
    user_id: string;
  };
}>(async (c, next) => {
  const id = c.req.param("id");
  const userId = c.get("user_id");

  if (!id) {
    return c.json({ error: "User ID is required" }, 400);
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
