# File Manager Application

A modern file management system built with a monorepo architecture using Elysia.js (Bun) for the backend and Vue.js for the frontend.

## Project Structure

```
file-manager-elysia-iks/
├── packages/
│   ├── backend/     # Elysia.js (Bun) API server
│   └── frontend/    # Vue.js frontend application
```

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Bun](https://bun.sh/) (for local development)
- [Node.js](https://nodejs.org/) (v18 or later)

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd file-manager-elysia-iks
   ```

2. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start all services using Docker Compose:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3010

## Local Development

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   # For backend
   cp packages/backend/.env.example packages/backend/.env
   # For frontend
   cp packages/frontend/.env.example packages/frontend/.env
   # For root
   cp .env.example .env
   ```

3. Start the development servers:
   ```bash
   # In the root directory
   bun run dev
   ```

### Manual Setup (Alternative to Docker)

If you're experiencing issues with Docker, you can use the provided manual setup script:

### Prerequisites

1. **PostgreSQL Database**: 
   - You need to have PostgreSQL installed and running on your machine
   - Create a database named `file_explorer_iks`
   - The default connection string is: `postgresql://{username}:{password}@localhost:5432/file_explorer_iks`
   - Update the `.env` file in the `packages/backend` directory with your database credentials

### Setup Steps

1. Make the script executable (if not already):
   ```bash
   chmod +x manual-setup.sh
   ```

2. Run the manual setup script:
   ```bash
   ./manual-setup.sh
   ```

This script will:
- Set up environment variables
- Install dependencies
- Initialize and seed the database
- Create two separate runner scripts: `run-backend.sh` and `run-frontend.sh`

3. Start the backend server in one terminal:
   ```bash
   ./run-backend.sh
   ```

4. Start the frontend server in another terminal:
   ```bash
   ./run-frontend.sh
   ```

You can then access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3010

This approach ensures both servers run reliably in their own dedicated terminals.

### Database Management

Reset and seed the database:
```bash
cd packages/backend
bun run prisma:fresh
```

## Available Scripts

- `bun run lint`: Lint all packages
- `bun run format`: Format code with Prettier
- `bun run dev`: Start development servers for all packages

## Docker Commands

- `docker-compose up`: Start all services
- `docker-compose down`: Stop all services
- `docker-compose up --build`: Rebuild and start all services

## License

[MIT](LICENSE)