#!/bin/bash

# Manual setup script for running the application without Docker

echo "🚀 Starting manual setup for File Manager application..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first: https://bun.sh/"
    exit 1
fi

# Setup environment variables
echo "📝 Setting up environment variables..."
cp -n .env.example .env
cp -n packages/backend/.env.example packages/backend/.env
cp -n packages/frontend/.env.example packages/frontend/.env

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Setup database
echo "🗄️ Setting up database..."
cd packages/backend

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️ PostgreSQL client not found. Make sure PostgreSQL is installed and properly configured."
    echo "⚠️ You need to create a database named 'file_explorer_iks' manually."
    echo "⚠️ Update the DATABASE_URL in packages/backend/.env with your credentials."
    read -p "Press Enter to continue anyway or Ctrl+C to abort..."
fi

echo "🔄 Initializing database with Prisma..."
bun run prisma:fresh
cd ../..

# Create separate scripts for backend and frontend
echo "#!/bin/bash
cd \"$(pwd)/packages/backend\"
echo \"🔧 Starting backend server on port 3010...\"
bun run dev
" > run-backend.sh

echo "#!/bin/bash
cd \"$(pwd)/packages/frontend\"
echo \"🎨 Starting frontend server...\"
bun run dev
" > run-frontend.sh

# Make scripts executable
chmod +x run-backend.sh run-frontend.sh

echo "✅ Setup complete!"
echo ""
echo "📋 To run the application:"
echo "1. Start the backend in one terminal:"
echo "   ./run-backend.sh"
echo ""
echo "2. Start the frontend in another terminal:"
echo "   ./run-frontend.sh"
echo ""
echo "🌐 Once running, you can access:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3010"