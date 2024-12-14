import { sign } from "hono/jwt";
import { User } from "../src/types/user";

export const createTestUserToken = async (user: User) => {
  const expiresIn1Minute = Math.floor(Date.now() / 1000) + 60;
  const accessToken = await sign(
    { id: user.id, email: user.email, role: user.role, exp: expiresIn1Minute },
    process.env.JWT_SECRET || ""
  );
  return accessToken;
};
