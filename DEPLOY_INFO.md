# Deployment Information

Создано: 2025-10-08 20:13:12
Версия: 2.0.0
Проект: TOLSTOVKA

## Инструкции по деплою на Ubuntu VPS

### 1. Распаковка архива
```bash
unzip tolstovka_deploy_20251008_201312.zip
cd tolstovka
```

### 2. Установка зависимостей
```bash
# Установите Node.js 18+ если не установлен
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите зависимости проекта
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..
```

### 3. Настройка окружения
```bash
# Создайте .env файл в папке server/
cd server
cp .env.example .env
nano .env

# Настройте переменные:
# - BOT_TOKEN=ваш_токен_бота
# - ADMIN_PASSWORD=ваш_пароль
# - PORT=3000
```

### 4. Сборка frontend
```bash
cd frontend
npm run build
cd ..
```

### 5. Настройка Nginx (опционально)
```bash
# Скопируйте конфигурацию nginx
sudo cp deploy/nginx/tolstovka.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/tolstovka.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Настройка SSL (опционально)
```bash
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

### 7. Запуск приложения

#### Вариант А: Через PM2 (рекомендуется)
```bash
# Установите PM2
sudo npm install -g pm2

# Запустите сервер
pm2 start server/src/index.js --name tolstovka-server
pm2 start server/src/bot.js --name tolstovka-bot

# Сохраните конфигурацию
pm2 save
pm2 startup
```

#### Вариант Б: Через systemd
```bash
# Создайте systemd сервис
sudo nano /etc/systemd/system/tolstovka.service

# Запустите сервис
sudo systemctl enable tolstovka
sudo systemctl start tolstovka
```

### 8. Проверка работы
```bash
# Проверьте статус
pm2 status

# Проверьте логи
pm2 logs tolstovka-server
pm2 logs tolstovka-bot

# Проверьте API
curl http://localhost:3000/api/health
```

## Обновление приложения

```bash
# Остановите приложение
pm2 stop all

# Распакуйте новый архив
unzip новый_архив.zip -d /tmp/tolstovka_new

# Скопируйте файлы (сохраняя .env и uploads/)
rsync -av --exclude='.env' --exclude='uploads/' /tmp/tolstovka_new/ ~/tolstovka/

# Установите зависимости
cd ~/tolstovka
npm install
cd frontend && npm install && cd ..
cd server && npm install && cd ..

# Пересоберите frontend
cd frontend && npm run build && cd ..

# Перезапустите приложение
pm2 restart all
```

## Полезные команды

```bash
# Просмотр логов
pm2 logs

# Мониторинг
pm2 monit

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all

# Информация о процессах
pm2 list
```

## Troubleshooting

### Проблемы с портами
```bash
# Проверьте занятые порты
sudo lsof -i :3000
sudo netstat -tlnp | grep :3000
```

### Проблемы с правами
```bash
# Дайте права на выполнение
chmod +x setup-ssl.sh
chmod +x server/src/*.js
```

### Проблемы с БД
```bash
# Проверьте файлы базы данных
ls -la server/data/
```

## Контакты

Telegram: @dmitriy_mityuk
