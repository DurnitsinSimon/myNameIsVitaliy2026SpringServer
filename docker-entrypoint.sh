#!/bin/sh
set -e

echo "Применение миграций базы данных..."
npx prisma migrate deploy

echo "Запуск приложения..."
exec "$@"