import { t } from "elysia";

export const SPaginationQuery = t.Object({
  limit: t.Number({
    minimum: 1,
    default: 10,
  }),
  page: t.Number({
    minimum: 1,
    default: 1,
  }),
});
