import { JWTPayload } from "hono/utils/jwt/types";

declare module "hono/jwt" {
  export interface UserJwtPayload extends JWTPayload {
    id: string;
    email: string;
    role: string;
  }
}