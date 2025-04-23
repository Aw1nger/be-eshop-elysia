import Elysia, { t } from "elysia";
import { sendVerificationEmail } from "../../lib/email";
import { redisClient } from "../../lib/redis-client";

const loginSchema = t.Object({
  email: t.String({
    format: "email",
    error: "Введите корректный email",
  }),
});

export const loginRoutes = new Elysia().post(
  "/login",
  async ({ body, set }) => {
    const { email } = body;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(email, code);
    await redisClient.setEx(`code:${email}`, 5 * 60, code);

    await sendVerificationEmail(email, code);

    set.status = 200;
    return { message: "Verification code sent successfully!", email };
  },
  { body: loginSchema, detail: { tags: ["Auth"] } },
);
