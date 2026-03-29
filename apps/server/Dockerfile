FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN pnpm install

COPY . .

RUN pnpm prisma generate

EXPOSE 4000

CMD ["pnpm", "dev"]
