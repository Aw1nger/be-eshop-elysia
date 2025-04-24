import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";

export const jwtPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: Bun.env.JWT_SECRET || "secret",
    exp: "1h",
    schema: t.Object({
      id: t.Number(),
      email: t.String({ format: "email", error: "Invalid email" }),
      username: t.String({
        minLength: 2,
        maxLength: 32,
        error: "Username must be between 2 and 32 characters long",
      }),
      avatar: t.String(),
      role: t.Enum({ user: "user", admin: "admin" }),
    }),
  }),
);
