#!/bin/sh
set -eu

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-ansi
fi

composer install --no-interaction --prefer-dist
php artisan migrate --force --no-ansi

exec php artisan serve --host=0.0.0.0 --port=8000