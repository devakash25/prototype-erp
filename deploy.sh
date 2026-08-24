#!/bin/bash
# DEV ERP - Production Deployment Script
# Run this on your VPS after SSH

set -e

echo "=== DEV ERP Deployment ==="

# 1. Check Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "Docker installed. Log out and back in, then re-run this script."
    exit 1
fi

# 2. Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# 3. Generate secrets if not set
if [ ! -f .env.production ]; then
    echo "Creating .env.production with generated secrets..."
    DB_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)
    JWT_REFRESH=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)

    cat > .env.production << EOF
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH}
APP_URL=https://your-domain.com
EOF
    echo "Created .env.production — edit APP_URL to your domain!"
    echo "Edit with: nano .env.production"
    exit 0
fi

# 4. Stop existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# 5. Build and start
echo "Building and starting services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# 6. Wait for DB
echo "Waiting for database..."
sleep 10

# 7. Seed database (first deploy only)
read -p "Seed database? (y/n, first deploy only): " SEED
if [ "$SEED" = "y" ]; then
    echo "Running seed..."
    docker compose -f docker-compose.prod.yml exec server npx tsx src/database/seed.ts
    docker compose -f docker-compose.prod.yml exec server npx tsx src/scripts/seed-parent.ts
    docker compose -f docker-compose.prod.yml exec server npx tsx src/scripts/seed-librarian.ts
    docker compose -f docker-compose.prod.yml exec server npx tsx src/scripts/seed-hostel.ts
fi

# 8. Status
echo ""
echo "=== Deployment Complete ==="
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Frontend: http://localhost"
echo "API: http://localhost/api/v1"
