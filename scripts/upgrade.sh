#!/usr/bin/env bash
set -e

# Pull latest changes
if ! command -v git >/dev/null 2>&1; then
  echo "Git is required but not installed. Please install Git and rerun this script."
  exit 1
fi

echo "Fetching latest changes..."
git pull --ff-only

echo "Installing/updating dependencies..."
npm install >/dev/null

# Ensure DATABASE_URL exists in .env for migrations
if [ ! -f .env ]; then
  echo ".env file not found. Please create it based on .env.example."
  exit 1
fi
DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set in .env. Please update .env and rerun."
  exit 1
fi
export DATABASE_URL

echo "Applying database migrations..."
if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy >/dev/null
else
  npx prisma db push >/dev/null
fi

echo "Upgrade complete."
