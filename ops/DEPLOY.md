# DEPLOY.md

Цель: развернуть Telegram Mini App «TOLSOVKA» на VPS (Linux) с доменом https://tolsovka.vercel.app, автозапуском через systemd и TLS через Nginx.

Предпосылки
- VPS с Ubuntu 22.04+ (или совместимой ОС)
- Домен tolsovka.vercel.app указывает на IP VPS (A-запись)
- Права sudo на сервере

1) Установка Node.js LTS
```bash
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v
npm -v
```

2) Размещение проекта
Вариант A (git clone):
```bash
sudo mkdir -p /var/www/tolsovka
sudo chown -R $USER:$USER /var/www/tolsovka
cd /var/www/tolsovka
# git clone <ВАШ GIT-РЕПОЗИТОРИЙ> .
```
Вариант B (scp/rsync):
```bash
# Скопируйте локальные файлы в /var/www/tolsovka
```

3) Конфигурация окружения
```bash
cd /var/www/tolsovka/server
cp .env.example .env
```
Заполните server/.env:
- PORT=8080
- BASE_URL=https://tolsovka.vercel.app
- SESSION_SECRET=<случайная_строка>
- DATABASE_FILE=./data/tolsovka.db
- ADMIN_CONFIG=./data/admin.json
- BOT_TOKEN=<токен_бота>
- MANAGER_USERNAME=@dmitriy_mityuk

Создайте директории:
```bash
mkdir -p /var/www/tolsovka/uploads
mkdir -p /var/www/tolsovka/server/data
```

4) Установка зависимостей
```bash
npm ci --prefix /var/www/tolsovka/server
```

5) Nginx (reverse proxy + TLS)
Пример конфигурации лежит в ops/nginx.conf. Адаптируйте пути:
- alias /var/www/tolsovka/uploads/
- proxy_pass http://127.0.0.1:8080

Скопируйте конфиг в /etc/nginx/sites-available и включите:
```bash
sudo cp /var/www/tolsovka/ops/nginx.conf /etc/nginx/sites-available/tolsovka
sudo ln -s /etc/nginx/sites-available/tolsovka /etc/nginx/sites-enabled/tolsovka
sudo nginx -t
sudo systemctl reload nginx
```

TLS (Let’s Encrypt):
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tolsovka.vercel.app
```

6) systemd юниты (автозапуск)
Подготовленные юниты:
- ops/systemd/tolsovka-server.service — HTTP сервер Mini App
- ops/systemd/tolsovka-bot.service — Telegram-бот

Скопируйте и включите:
```bash
sudo cp /var/www/tolsovka/ops/systemd/tolsovka-server.service /etc/systemd/system/
sudo cp /var/www/tolsovka/ops/systemd/tolsovka-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tolsovka-server tolsovka-bot
sudo systemctl start tolsovka-server tolsovka-bot
```
Проверка логов:
```bash
sudo journalctl -u tolsovka-server -f
sudo journalctl -u tolsovka-bot -f
```

7) Проверка
- API: curl http://127.0.0.1:8080/api/health
- Откройте https://tolsovka.vercel.app в браузере
- Бот: отправьте /start 

8) Обновления
```bash
cd /var/www/tolsovka
# git pull (или обновите файлы)
npm ci --prefix server
sudo systemctl restart tolsovka-server
# если меняли бот или .env -> sudo systemctl restart tolsovka-bot
```

9) Бэкапы
- База: /var/www/tolsovka/server/data/tolsovka.db
- Медиа: /var/www/tolsovka/uploads
Рекомендуется регулярное копирование этих директорий.

Примечания
- Весь UX mobile-first: проект запускается как Telegram WebApp, desktop-верстка не требуется.
- Секреты хранить только в server/.env, не коммитить.