# Use Bun image
FROM oven/bun:1.1

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN bun install

# Build the Vite app
RUN bun run build

# Install serve to serve static files
RUN bun add serve

# Run the built app
CMD ["bun", "x", "serve", "dist"]
