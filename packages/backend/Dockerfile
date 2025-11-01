FROM oven/bun:latest as base

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
# Install dependencies without lockfile
RUN bun install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Expose the port
EXPOSE 3010

# Start the application
CMD ["bun", "run", "dev"]