#!/bin/bash
# TOLSTOVKA SSL Setup Script
# Запускать ПОСЛЕ того как домен tolstovka39.ru направлен на VPS

set -e

echo "🔒 Настройка SSL сертификатов для tolstovka39.ru"
echo "=============================================="

# Проверяем что домен направлен на этот сервер
echo "📍 Проверяем DNS настройки..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(nslookup tolstovka39.ru 8.8.8.8 | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)

echo "IP сервера: $SERVER_IP"
echo "IP домена tolstovka39.ru: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo "❌ ОШИБКА: Домен tolstovka39.ru не направлен на этот сервер!"
    echo "Настрой DNS записи в панели управления доменом:"
    echo "tolstovka39.ru      A     $SERVER_IP"
    echo "www.tolstovka39.ru  A     $SERVER_IP"
    exit 1
fi

echo "✅ DNS настройки корректны"

# Запрашиваем email для Let's Encrypt
read -p "📧 Введи email для уведомлений Let's Encrypt: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "❌ Email обязателен для получения SSL сертификатов"
    exit 1
fi

# Останавливаем nginx для получения сертификатов
echo "⏸️  Временно останавливаем nginx..."
systemctl stop nginx

# Получаем SSL сертификаты
echo "🔐 Получаем SSL сертификаты от Let's Encrypt..."
certbot certonly --standalone \
    -d tolstovka39.ru \
    -d www.tolstovka39.ru \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --force-renewal

# Обновляем Nginx конфигурацию
echo "⚙️  Обновляем Nginx конфигурацию..."
cat > /etc/nginx/sites-available/tolstovka << 'EOF'
server {
    listen 80;
    server_name tolstovka39.ru www.tolstovka39.ru;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tolstovka39.ru www.tolstovka39.ru;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/tolstovka39.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tolstovka39.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend static files
    location / {
        root /var/www/tolstovka/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Fallback для тестирования (удалить после загрузки кода)
        try_files $uri $uri/ /index.html @fallback;
    }
    
    # Временный fallback (удалить после загрузки кода)
    location @fallback {
        root /var/www/tolstovka;
        try_files /index.html =404;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/tolstovka/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy to Express backend
    location /api {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем лимиты для загрузки файлов
        client_max_body_size 50M;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # Uploads static files
    location /uploads {
        root /var/www/tolstovka;
        expires 1y;
        add_header Cache-Control "public";
        
        # CORS headers для изображений
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
        
        # Handle OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # Logs
    access_log /var/log/nginx/tolstovka.access.log;
    error_log /var/log/nginx/tolstovka.error.log;
}
EOF

# Проверяем конфигурацию nginx
echo "🔍 Проверяем конфигурацию nginx..."
nginx -t

# Запускаем nginx
echo "▶️  Запускаем nginx..."
systemctl start nginx
systemctl reload nginx

# Настраиваем автообновление сертификатов
echo "🔄 Настраиваем автообновление сертификатов..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Проверяем результат
echo "🎉 SSL настройка завершена!"
echo ""
echo "✅ Проверки:"
echo "1. HTTPS: https://tolstovka39.ru"
echo "2. Redirect: http://tolstovka39.ru -> https://tolstovka39.ru"
echo "3. SSL Grade: https://www.ssllabs.com/ssltest/analyze.html?d=tolstovka39.ru"
echo ""
echo "📋 Статус сертификатов:"
certbot certificates
echo ""
echo "🔄 Автообновление настроено, проверка:"
systemctl status certbot.timer --no-pager -l
echo ""
echo "🚀 Теперь можешь загружать код проекта!"