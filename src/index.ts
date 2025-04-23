import Elysia from "elysia";

import { ApiError } from "./lib/api-error";
import { swaggerplugin } from "./plugins/swagger";
import { createProductsRoutes } from "./routes/shop/create-products";
import { getProductsRoutes } from "./routes/shop/get-products";
import { loginRoutes } from "./routes/user/login";
import { loginCodeRoutes } from "./routes/user/login-code";
import { refreshTokenRoutes } from "./routes/user/refresh-token";
import { registerRoutes } from "./routes/user/register";
import { verifyEmailRoutes } from "./routes/user/verify-email";

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

app.group("/user", (app) =>
  app
    .use(registerRoutes)
    .use(verifyEmailRoutes)
    .use(refreshTokenRoutes)
    .use(loginRoutes)
    .use(loginCodeRoutes),
);

app.group("/products", (app) =>
  app.use(createProductsRoutes).use(getProductsRoutes),
);

app.listen(8000, () => {
  console.info("🦊 Server started on port 8000");
  console.info("🔗 Swagger:", "http://localhost:8000/swagger");
});
