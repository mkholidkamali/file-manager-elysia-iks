#!/bin/bash

# File Manager Setup Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting File Manager Setup...${NC}"

# Check if root .env file exists, if not create it from example
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating root .env file from example...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Created root .env file${NC}"
else
  echo -e "${GREEN}Root .env file already exists${NC}"
fi

# Check if backend .env file exists, if not create it from example
if [ ! -f packages/backend/.env ]; then
  echo -e "${YELLOW}Creating backend .env file from example...${NC}"
  cp packages/backend/.env.example packages/backend/.env
  echo -e "${GREEN}Created backend .env file${NC}"
else
  echo -e "${GREEN}Backend .env file already exists${NC}"
fi

# Check if frontend .env file exists, if not create it from example
if [ -f packages/frontend/.env.example ] && [ ! -f packages/frontend/.env ]; then
  echo -e "${YELLOW}Creating frontend .env file from example...${NC}"
  cp packages/frontend/.env.example packages/frontend/.env
  echo -e "${GREEN}Created frontend .env file${NC}"
elif [ ! -f packages/frontend/.env.example ]; then
  echo -e "${YELLOW}No frontend .env.example found, skipping frontend .env creation${NC}"
else
  echo -e "${GREEN}Frontend .env file already exists${NC}"
fi

# Build and start Docker containers
echo -e "${YELLOW}Building and starting Docker containers...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Run database migrations and seed
echo -e "${YELLOW}Running database migrations and seed...${NC}"
docker-compose exec backend bun run prisma:init

echo -e "${GREEN}Setup complete! Your application is running at:${NC}"
echo -e "${GREEN}Frontend: http://localhost:80${NC}"
echo -e "${GREEN}Backend API: http://localhost:3010${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "- View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "- Stop services: ${GREEN}docker-compose down${NC}"
echo -e "- Restart services: ${GREEN}docker-compose restart${NC}"