# 8gent Control Plane Dockerfile
FROM oven/bun:1.1-alpine

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY src/ ./src/
RUN bun build src/index.ts --outdir dist --target node

RUN adduser -D -u 1001 controlplane
USER controlplane

EXPOSE 18787

CMD ["bun", "run", "dist/index.js"]
