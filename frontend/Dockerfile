# Use Bun image
FROM oven/bun:1.1

# Set working directory
WORKDIR /app

# Debug: Show files in current dir
RUN ls -la

# Copy everything
COPY . .

# Debug: Show files after copy
RUN ls -la

# Install dependencies
RUN bun install

# Build the Vite app
RUN bun run build

# Install serve to serve static files
RUN bun add serve

# Run the built app
CMD ["bun", "x", "serve", "dist"]
