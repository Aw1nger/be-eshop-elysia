import { Prisma } from "@prisma/client";
import Elysia, { t } from "elysia";
import { ApiError } from "../../lib/api-error";
import { sendVerificationEmail } from "../../lib/email";
import { prisma } from "../../lib/prisma-client";
import { redisClient } from "../../lib/redis-client";

const registerSchema = t.Object({
  email: t.String({
    format: "email",
    error: "Invalid email :(",
  }),
  username: t.String({
    minLength: 2,
    maxLength: 32,
    error: "Username must be between 2 and 32 characters long",
  }),
});

export const registerRoutes = new Elysia().post(
  "/register",
  async ({ body, set }) => {
    const { email, username } = body;

    try {
      await prisma.user.create({
        data: {
          email,
          username,
          trusted_email: false,
          role: "user",
        },
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.setEx(`verification:${email}`, 5 * 60, code);

      await sendVerificationEmail(email, code);

      return { message: "Registration successful! Verify your email!", email };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const target = error.meta?.target as string[] | undefined;
        set.status = 400;
        return {
          message: "Registration failed",
          fields: target?.map((field) => ({
            field,
            message: `This ${field} already exists`,
          })) || [{ field: "unknown", message: "Unique constraint failed" }],
        };
      }

      throw new ApiError("Unexpected error in registration", 500, {
        route: "/user/register",
        details: error,
      });
    }
  },
  {
    body: registerSchema,
    detail: { tags: ["Auth"] },
  },
);
