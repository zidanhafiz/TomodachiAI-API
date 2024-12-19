import { Hono } from "hono";
import { sign, UserJwtPayload, verify } from "hono/jwt";
import { zValidator } from "../middlewares/validator";

import userModels from "../models/user";
import { loginSchema, refreshTokenSchema, signupSchema } from "../utils/schemas/userSchemas";
import { createDescription } from "../utils/openApiUtils";

const auth = new Hono()
  .post(
    "/signup",
    createDescription(["Authentication"], "Register a new user", signupSchema.successResponse, signupSchema.errorResponse),
    zValidator("json", signupSchema.requestBody),
    async (c) => {
      try {
        const { email, first_name, last_name, password } = c.req.valid("json");

        const isUserExists = await userModels.getUserByEmail(email);

        if (isUserExists) {
          return c.json({ error: "User already exists" }, 400);
        }

        const hashedPassword = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });

        await userModels.createUser({ email, firstName: first_name, lastName: last_name, password: hashedPassword, role: "USER" });

        return c.json({ data: "Successfully registered user" });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to register user" }, 500);
      }
    }
  )
  .post(
    "/login",
    createDescription(["Authentication"], "Login user", loginSchema.successResponse, loginSchema.errorResponse),
    zValidator("json", loginSchema.requestBody),
    async (c) => {
      try {
        const { email, password } = c.req.valid("json");

        const user = await userModels.getUserByEmail(email);

        if (!user) {
          return c.json({ error: "Invalid email or password" }, 400);
        }

        const isPasswordCorrect = await Bun.password.verify(password, user.password);

        if (!isPasswordCorrect) {
          return c.json({ error: "Invalid email or password" }, 400);
        }

        const expiresIn14Days = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;
        const expiresIn1Day = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

        const accessToken = await sign({ id: user.id, email: user.email, role: user.role, exp: expiresIn1Day }, process.env.JWT_SECRET || "");
        const refreshToken = await sign({ id: user.id, email: user.email, role: user.role, exp: expiresIn14Days }, process.env.JWT_SECRET || "");

        await userModels.updateUser(user.id, { refreshToken });

        return c.json({ data: { access_token: accessToken, refresh_token: refreshToken } });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to login" }, 500);
      }
    }
  )
  .post(
    "/refresh",
    createDescription(["Authentication"], "Get a new Access Token", refreshTokenSchema.successResponse, refreshTokenSchema.errorResponse),
    zValidator("json", refreshTokenSchema.requestBody),
    async (c) => {
      try {
        const { refresh_token } = c.req.valid("json");

        if (!refresh_token) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const decoded = await (<Promise<UserJwtPayload>>verify(refresh_token, process.env.JWT_SECRET || ""));

        if (!decoded.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const user = await userModels.getUserById(decoded.id);

        if (!user) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const expiresIn1Day = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

        const accessToken = await sign({ id: user.id, email: user.email, role: user.role, exp: expiresIn1Day }, process.env.JWT_SECRET || "");

        return c.json({ data: { access_token: accessToken } });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to refresh token" }, 500);
      }
    }
  );

export default auth;
