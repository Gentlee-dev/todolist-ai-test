FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared package
COPY packages/shared ./packages/shared/

# Copy server package
COPY apps/server/package.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma/

RUN pnpm install --frozen-lockfile

COPY apps/server ./apps/server/

WORKDIR /app/apps/server

RUN npx prisma generate

EXPOSE 4000

CMD ["pnpm", "dev"]
