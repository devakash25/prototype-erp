#!/bin/bash
set -e

echo "=== DEV ERP — Docker Deployment ==="

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "⚠️  EDIT .env with your secrets before starting!"
  echo "   Run: nano .env"
  echo ""
  exit 1
fi

# Build frontend
echo "Building frontend..."
cd client
npm install
VITE_API_URL="" npm run build
cd ..

# Start services
echo "Starting Docker services..."
docker compose -f docker-compose.prod.yml up -d --build

# Wait for API to be healthy
echo "Waiting for API to start..."
sleep 10

# Run database migration + seed
echo "Running database migration..."
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:80"
echo "API:      http://localhost:5000"
echo "Health:   http://localhost:5000/health"
echo ""
echo "Default login: admin@dev-erp.com / Admin@123"
echo ""
echo "To seed database: docker compose -f docker-compose.prod.yml exec api npx prisma db seed"
