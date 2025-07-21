FROM oven/bun:1.1

WORKDIR /app

# Show files before and after copy (optional debug)
RUN echo "== Before COPY ==" && ls -la

COPY ./frontend/ ./



RUN echo "== After COPY ==" && ls -la && cat package.json

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN bun install
RUN bun run build
RUN bun add serve

CMD ["bun", "x", "serve", "dist"]
