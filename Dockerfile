FROM oven/bun:alpine as base

WORKDIR /app

COPY package.json bun.lockb ./

# Production
FROM base as production

ENV NODE_ENV=production

RUN bun install --production

COPY . .

EXPOSE 3000

RUN bunx prisma generate

RUN bun build src/index.ts --outdir=dist --target=bun

CMD ["bun", "run", "start"]

# Development
FROM base as development

ENV NODE_ENV=development

RUN bun install

COPY . .

RUN bunx prisma generate 

EXPOSE 4000

CMD ["bun", "run", "dev"]
