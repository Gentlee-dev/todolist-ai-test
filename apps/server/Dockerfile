FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared package
COPY packages/shared ./packages/shared/

# Copy server package
COPY apps/server ./apps/server/

RUN pnpm install

WORKDIR /app/apps/server

RUN pnpm prisma generate

EXPOSE 4000

CMD ["pnpm", "dev"]
