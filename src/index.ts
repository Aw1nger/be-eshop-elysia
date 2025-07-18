import Elysia from "elysia";

import { ApiError } from "./lib/api-error";
import { swaggerplugin } from "./plugins/swagger";
import { loginRoutes } from "./routes/auth/login";
import { loginCodeRoutes } from "./routes/auth/login-code";
import { refreshTokenRoutes } from "./routes/auth/refresh-token";
import { registerRoutes } from "./routes/auth/register";
import { tokenRoutes } from "./routes/auth/token";
import { verifyEmailRoutes } from "./routes/auth/verify-email";
import { addProductRoute as addCartRoutes } from "./routes/cart/add-cart";
import { deleteProductRoute as deleteCartRoutes } from "./routes/cart/delete-cart";
import { getCartRoute as getCartRoutes } from "./routes/cart/get-cart";
import { getSumRoute } from "./routes/cart/get-sum";
import { createOrderRoutes } from "./routes/order/create-order";
import { createProductsRoutes } from "./routes/shop/create-products";
import { deleteProductRoutes } from "./routes/shop/delete-product";
import { getProductRoutes } from "./routes/shop/get-product";
import { getProductsRoutes } from "./routes/shop/get-products";
import { uploadProductsPhotoRoutes } from "./routes/shop/upload-products-photo";
import { userProductsRoutes } from "./routes/user/products";
import { uploadAvatarRoutes } from "./routes/user/upload-avatar";
import { userRoutes } from "./routes/user/username";

const app = new Elysia();

app.use(swaggerplugin);

app.onError(({ error, set, path, code }) => {
  console.log(`Error in ${path}:`, error);

  if (code === "VALIDATION") {
    set.status = 400;
    return {
      success: false,
      errors: error.all,
    };
  }

  if (error instanceof ApiError) {
    set.status = error.status;
    return {
      message: error.message,
      route: error.context?.route || path,
      details: error.context?.details,
    };
  }

  console.error("Unexpected error:", error);
  set.status = 500;
  return { message: "Internal server error" };
});

app.group("/order", { detail: { tags: ["Order"] } }, (app) =>
  app.use(createOrderRoutes),
);

app.group("/cart", { detail: { tags: ["Cart"] } }, (app) =>
  app
    .use(addCartRoutes)
    .use(getCartRoutes)
    .use(deleteCartRoutes)
    .use(getSumRoute),
);

app.group("/products", (app) =>
  app
    .use(createProductsRoutes)
    .use(getProductsRoutes)
    .use(getProductRoutes)
    .use(deleteProductRoutes)
    .use(uploadProductsPhotoRoutes),
);

app.group("/auth", (app) =>
  app
    .use(registerRoutes)
    .use(verifyEmailRoutes)
    .use(refreshTokenRoutes)
    .use(tokenRoutes)
    .use(loginRoutes)
    .use(loginCodeRoutes),
);

app.group("/user", (app) =>
  app.use(userRoutes).use(userProductsRoutes).use(uploadAvatarRoutes),
);

app.listen(8000, () => {
  console.info(`🦊 Elysia is running at on port ${app.server?.port}`);
  console.info("🔗 Swagger:", `http://localhost:${app.server?.port}/swagger`);
});
