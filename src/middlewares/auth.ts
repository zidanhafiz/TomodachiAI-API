import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

const authVerify = createMiddleware(
  bearerAuth({
    verifyToken: async (token, c) => {
      try {
        const decoded = await verify(token, process.env.JWT_SECRET || "");
        if (decoded.id) {
          c.set("user_id", decoded.id);
          c.set("user_role", decoded.role);
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
  })
);

export { authVerify };
