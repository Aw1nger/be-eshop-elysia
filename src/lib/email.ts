import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.com",
  port: 465,
  secure: true,
  auth: {
    user: Bun.env.YANDEX_SMTP_USER,
    pass: Bun.env.YANDEX_SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: Bun.env.YANDEX_SMTP_USER,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${code}`,
  });
}
