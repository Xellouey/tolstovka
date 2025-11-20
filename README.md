# TOLSTOVKA - Telegram Mini App

Каталог товаров для Telegram Mini App с админ-панелью.

## 🚀 Статус деплоя

- **Production URL**: https://tolstovka.vercel.app
- **Platform**: Vercel (статический сайт + serverless API)
- **Telegram Bot**: Требует отдельного хостинга

## 📁 Структура проекта

```
/
├── api/                 # Serverless функции Vercel
│   ├── categories.js    # GET /api/categories
│   ├── products.js      # GET /api/products
│   ├── product.js       # GET /api/product?id=XXX
│   ├── banners.js       # GET /api/banners
│   └── health.js        # GET /api/health
├── web/                 # Статические файлы
│   ├── index.html       # Основное Mini App приложение
│   └── admin/           # Админ-панель (требует БД)
├── server/              # Node.js сервер (для локальной разработки)
├── uploads/             # Статические изображения
└── vercel.json          # Конфигурация Vercel
```

## ✅ Что работает на Vercel

1. **Telegram Mini App** - полностью функционален
2. **API endpoints** - базовые операции чтения (mock data)
3. **SPA routing** - навигация по товарам и категориям
4. **Статические файлы** - раздача из папки `web/`

## ⚠️ Ограничения Vercel версии

1. **База данных** - используются mock данные (нет persistent storage)
2. **Админ-панель** - не работает (требует БД и аутентификация)
3. **Загрузка файлов** - не поддерживается
4. **Telegram Bot** - требует отдельного хостинга

## 🛠 Локальная разработка

Для полноценной разработки с базой данных:

```bash
# Восстановите package.json
mv package.json.backup package.json
mv package-lock.json.backup package-lock.json

# Установите зависимости
cd server
npm install

# Настройте .env
cp .env.example .env
# Отредактируйте .env файл

# Запустите сервер
npm run dev

# В отдельном терминале запустите бота
npm run start:bot
```

## 🌐 Деплой на Vercel

### Автоматический деплой
1. Push в GitHub репозиторий
2. Vercel автоматически подхватывает изменения
3. Деплой происходит автоматически

### Ручная настройка
1. Импортируйте репозиторий на vercel.com
2. Настройки уже прописаны в `vercel.json`
3. Никаких переменных окружения не требуется для базовой версии

## 📱 Интеграция с Telegram

### Настройка бота
1. Создайте бота через @BotFather
2. Получите токен бота
3. Настройте Menu Button:
   ```
   /setmenubutton
   Выберите бота
   Укажите URL: https://tolstovka.vercel.app
   Текст кнопки: Каталог
   ```

### Запуск бота
Бот требует отдельного хостинга:
- **VPS** - инструкции в `ops/DEPLOY.md`
- **Heroku/Railway** - для простого хостинга
- **Webhook + Vercel/Cloudflare** - для serverless

## 🚫 Правила разработки

### КРИТИЧЕСКОЕ ПРАВИЛО: НЕ СОЗДАВАТЬ ДЕМО ВЕРСИИ

**ЗАПРЕЩЕНО создавать демонстрационные компоненты, страницы или роуты!**

❌ **Что НЕ делать:**
- Создавать компоненты с суффиксом "Demo" 
- Создавать демо-страницы для показа функционала
- Добавлять роуты типа "/demo", "/admin-demo", "/showcase"
- Создавать песочницы для тестирования компонентов
- Добавлять любые демонстрационные материалы в продакшн код

✅ **Что делать вместо этого:**
- Обновлять существующие компоненты и страницы
- Тестировать изменения на реальных страницах (/admin, /, /p/:id)
- Использовать существующую структуру проекта
- Создавать документацию в README файлах при необходимости

**Обоснование:** Демо версии засоряют проект, создают дублирование кода и не несут продакшн ценности. Все изменения должны интегрироваться в реальную функциональность приложения.

*Подробные правила разработки см. в файле `WARP.md`*

## 🔄 Миграция на полноценную БД

Для production рекомендуется:

### 1. Vercel KV (Redis)
```javascript
// api/products.js
import { kv } from '@vercel/kv';
const products = await kv.get('products') || [];
```

### 2. Vercel Postgres
```javascript
import { sql } from '@vercel/postgres';
const { rows } = await sql`SELECT * FROM products`;
```

### 3. MongoDB Atlas
```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI);
```

## 📝 Roadmap

- [ ] Интеграция с внешней БД
- [ ] Восстановление админ-панели
- [ ] Загрузка изображений через Cloudinary/S3
- [ ] Telegram Payments API
- [ ] Уведомления о заказах
- [ ] Аналитика и статистика

## 🆘 Поддержка

При проблемах с деплоем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь что структура папок корректна
3. API доступен по адресу: https://tolstovka.vercel.app/api/health

## 📄 Лицензия

Proprietary - Все права защищены

## 👤 Контакты

Менеджер: @dmitriy_mityuk