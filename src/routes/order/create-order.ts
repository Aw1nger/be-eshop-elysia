import axios from "axios";
import Elysia from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";

// Настройки Тинькофф
const TINKOFF_TERMINAL_KEY = "TinkoffBankTest";
const TINKOFF_API_URL = "https://securepay.tinkoff.ru/v2/Init";

export const createOrderRoutes = new Elysia()
  .use(isAuth)
  .post("/create-order", async ({ user }) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Получаем корзину пользователя
    const cartItems = await prisma.cart.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new ApiError("Cart is empty", 400);
    }

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        date: new Date(),
      },
    });

    // Добавляем товары в заказ
    const orderProducts = cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.count,
      sum: Number(item.product.price) * item.count,
    }));

    await prisma.orderProduct.createMany({
      data: orderProducts,
    });

    // Считаем общую сумму
    const totalAmount = orderProducts.reduce((sum, item) => sum + item.sum, 0);

    // Генерируем ссылку на оплату
    const paymentLink = await generateTinkoffPaymentLink(
      order.id,
      totalAmount,
      user.email,
    );

    // Очищаем корзину
    await prisma.cart.deleteMany({
      where: { userId: user.id },
    });

    return { paymentLink };
  });

// Функция для генерации ссылки на оплату через Тинькофф
async function generateTinkoffPaymentLink(
  orderId: number,
  amount: number,
  email: string,
) {
  const response = await axios.post(TINKOFF_API_URL, {
    TerminalKey: TINKOFF_TERMINAL_KEY,
    Amount: amount * 100,
    OrderId: crypto.randomUUID(),
    TestMode: true,
    Description: `Оплата заказа Elysia Test Payment`,
    DATA: {
      Email: email,
      QR: true,
    },
    SuccessURL: `${Bun.env.FRONT_URL}/confirm-pay/${orderId}`,
    FailURL: `${Bun.env.FRONT_URL}/confirm-pay/${orderId}`,
  });

  return response.data.PaymentURL;
}
