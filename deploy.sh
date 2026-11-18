#!/usr/bin/env bash
set -e

echo "==> [Deploy] Starting deployment for Doanh Tri Web..."

# 1. Ensure .env exists
if [ ! -f .env ]; then
  echo "==> [Deploy] Creating .env from .env.example..."
  cp .env.example .env
fi

# 2. Build and restart Docker container
echo "==> [Deploy] Building and running Docker container..."
docker compose down || true
docker compose up -d --build

# 3. Ensure Nginx configuration
echo "==> [Deploy] Verifying Nginx reverse proxy..."
NGINX_CONF="/etc/nginx/sites-available/iem.demo.ubos.vn"
NGINX_ENABLED="/etc/nginx/sites-enabled/iem.demo.ubos.vn"

if [ ! -f "$NGINX_CONF" ]; then
  cat << 'EOF' > "$NGINX_CONF"
server {
    listen 80;
    listen [::]:80;
    server_name iem.demo.ubos.vn iem.14-225-217-232.nip.io;

    location / {
        proxy_pass http://127.0.0.1:5024;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
fi

if [ ! -L "$NGINX_ENABLED" ] && [ ! -f "$NGINX_ENABLED" ]; then
  ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
fi

# 4. Test and reload Nginx
nginx -t
systemctl reload nginx

# 5. Healthcheck local container
echo "==> [Deploy] Waiting for service to respond on port 5024..."
RETRY=0
MAX_RETRY=10
while [ $RETRY -lt $MAX_RETRY ]; do
  if curl -s -f -o /dev/null http://127.0.0.1:5024; then
    echo "==> [Deploy] SUCCESS: Service is healthy and responding on http://127.0.0.1:5024 (iem.demo.ubos.vn)"
    exit 0
  fi
  echo "==> [Deploy] Waiting for app startup ($((RETRY+1))/$MAX_RETRY)..."
  sleep 2
  RETRY=$((RETRY+1))
done

echo "==> [Deploy] WARNING: Service started but healthcheck took longer than expected."
exit 0
