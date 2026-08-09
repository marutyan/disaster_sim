FROM node:22-bookworm-slim

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.12.0 --activate

COPY package.json pnpm-workspace.yaml biome.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN pnpm install --no-frozen-lockfile

COPY apps/web apps/web
COPY packages/domain packages/domain

EXPOSE 3000
CMD ["pnpm", "--filter", "@disaster-sim/web", "dev", "--hostname", "0.0.0.0"]
