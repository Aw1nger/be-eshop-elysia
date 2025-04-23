FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile
COPY src ./src/
COPY prisma  ./prisma/

RUN bunx prisma generate
RUN ls
RUN bun run build

FROM build AS base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY --from=build app/main.ts .
RUN ls

EXPOSE 8000
CMD ["bun", "run", "main.ts"]
