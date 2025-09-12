#!/usr/bin/env bash
set -e

### Ensure Node.js is available
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not installed. Please install Node.js and rerun this script."
  exit 1
fi

### Install or update dependencies
if [ -d node_modules ]; then
  echo "Updating dependencies..."
  npm install >/dev/null
else
  echo "Installing dependencies..."
  npm install >/dev/null
fi

### Prepare environment file
if [ ! -f .env ]; then
  echo "Creating .env from template..."
  cp .env.example .env
fi

### Read DATABASE_URL from .env
DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set in .env. Please update .env and rerun."
  exit 1
fi
export DATABASE_URL

### Install PostgreSQL if missing
if ! command -v psql >/dev/null 2>&1; then
  echo "Installing PostgreSQL..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update >/dev/null
    sudo apt-get install -y postgresql >/dev/null
  else
    echo "PostgreSQL not found and automatic installation is unavailable."
    exit 1
  fi
fi

### Ensure PostgreSQL service is running
if command -v pg_isready >/dev/null 2>&1 && ! pg_isready >/dev/null 2>&1; then
  echo "Starting PostgreSQL service..."
  sudo service postgresql start >/dev/null 2>&1 || sudo systemctl start postgresql >/dev/null 2>&1 || true
fi

### Parse connection details
DB_USER=$(echo "$DATABASE_URL" | sed -E 's#.*://([^:]+):.*#\1#')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's#.*/([^/?]+).*#\1#')

ADMIN_PSQL="psql -U postgres"
if command -v sudo >/dev/null 2>&1; then
  ADMIN_PSQL="sudo -u postgres psql"
fi

### Ensure user exists
if ! $ADMIN_PSQL -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  echo "Creating PostgreSQL role '$DB_USER'..."
  $ADMIN_PSQL -c "CREATE ROLE \"$DB_USER\" WITH LOGIN PASSWORD '$DB_PASS';" >/dev/null
fi

### Ensure database exists
if ! $ADMIN_PSQL -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  echo "Creating database '$DB_NAME'..."
  $ADMIN_PSQL -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" >/dev/null
fi

### Apply Prisma schema and seed data
if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy >/dev/null
else
  npx prisma db push >/dev/null
fi
npm run prisma:seed >/dev/null

echo "Setup complete. Database is ready."

