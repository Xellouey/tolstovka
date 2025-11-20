# 🚀 Быстрое руководство по обновлению сайта

## Обновление через архив (рекомендуется)

### 1. На Windows (создание архива)
```bash
python create_deploy_archive.py
```

### 2. Загрузка на сервер
```bash
scp deploy_archives/tolstovka_deploy_YYYYMMDD_HHMMSS.zip root@YOUR_VPS:/var/www/tolstovka/
```

### 3. На сервере (деплой)
```bash
cd /var/www/tolstovka

# Распаковать архив
unzip -o tolstovka_deploy_*.zip

# Установить зависимости (если изменились)
npm install --no-fund --no-audit
cd server && npm install --no-fund --no-audit && cd ..
cd frontend && npm install --no-fund --no-audit && cd ..

# Собрать frontend
cd frontend
npm run build-only
cd ..

# Исправить права (если нужно)
chown -R tolstovka:tolstovka server/
chmod 664 server/database.db

# Перезапустить процессы
su - tolstovka -c "pm2 restart all"
su - tolstovka -c "pm2 save"
```

## Только обновление frontend

```bash
cd /var/www/tolstovka/frontend
npm run build-only

# Nginx автоматически подхватит изменения
# Пользователи должны очистить кеш браузера
```

## Только обновление backend

```bash
cd /var/www/tolstovka/server
# Внести изменения

# Перезапустить
su - tolstovka -c "pm2 restart tolstovka-server"
```

## Проверка статуса

```bash
# PM2 процессы
su - tolstovka -c "pm2 list"
su - tolstovka -c "pm2 logs --lines 20"

# Nginx
systemctl status nginx
nginx -t

# API
curl http://localhost:8081/api/health
curl https://tolstovka39.ru/api/health
```

## Важные пути

- Frontend source: `/var/www/tolstovka/frontend/`
- Frontend build: `/var/www/tolstovka/frontend/dist/`
- Backend: `/var/www/tolstovka/server/`
- База данных: `/var/www/tolstovka/server/database.db`
- Nginx config: `/etc/nginx/sites-enabled/tolstovka`
- Uploads: `/var/www/tolstovka/uploads/`

## Полезные команды

```bash
# Просмотр логов
su - tolstovka -c "pm2 logs"
su - tolstovka -c "pm2 logs tolstovka-server"
su - tolstovka -c "pm2 logs tolstovka-bot"

# Мониторинг
su - tolstovka -c "pm2 monit"

# Перезапуск
su - tolstovka -c "pm2 restart all"
su - tolstovka -c "pm2 reload all"  # Zero-downtime

# Остановка
su - tolstovka -c "pm2 stop all"

# Запуск
su - tolstovka -c "pm2 start all"
```

## Откат к предыдущей версии

```bash
# Если есть backup
cd /var/www/tolstovka
rm -rf frontend/dist
cp -r frontend/dist.backup frontend/dist

# Перезапустить процессы
su - tolstovka -c "pm2 restart all"
```

## Troubleshooting

### Сайт не обновляется
1. Проверьте дату файлов: `ls -la /var/www/tolstovka/frontend/dist/`
2. Очистите кеш браузера: Ctrl + Shift + Delete
3. Жесткая перезагрузка: Ctrl + F5
4. Проверьте Nginx config: `nginx -t`

### API не работает
1. Проверьте процессы: `su - tolstovka -c "pm2 list"`
2. Проверьте логи: `su - tolstovka -c "pm2 logs tolstovka-server"`
3. Проверьте порт: `curl http://localhost:8081/api/health`
4. Проверьте права БД: `ls -la server/database.db`

### База данных readonly
```bash
chown tolstovka:tolstovka server/database.db
chmod 664 server/database.db
su - tolstovka -c "pm2 restart tolstovka-server"
```

### Нехватка памяти при сборке
```bash
# Используйте build-only вместо build
cd frontend
npm run build-only
```

---
**Обновлено:** 2025-10-08
