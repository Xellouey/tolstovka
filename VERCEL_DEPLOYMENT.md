# Деплой TOLSTOVKA на Vercel

## Текущий статус
Проект адаптирован для работы на Vercel с использованием serverless функций.

## Структура проекта для Vercel

```
/
├── api/                 # Serverless функции (API endpoints)
│   ├── categories.js    # GET /api/categories
│   ├── products.js      # GET /api/products
│   ├── product.js       # GET /api/product?id=XXX
│   └── banners.js       # GET /api/banners
├── web/                 # Статические файлы
│   ├── index.html       # Основное приложение
│   └── admin/           # Админ-панель (временно отключена)
├── uploads/             # Статические изображения
└── vercel.json          # Конфигурация Vercel
```

## Что изменилось

### 1. API преобразован в Serverless Functions
- Вместо Express.js сервера теперь используются отдельные функции в папке `/api`
- Каждая функция обрабатывает свой endpoint
- Данные временно захардкожены в функциях (mock data)

### 2. База данных
- SQLite не поддерживается в serverless окружении Vercel
- Текущее решение: mock данные в функциях
- Для production рекомендуется использовать:
  - **Vercel KV** (Redis) для простых данных
  - **Vercel Postgres** для реляционных данных
  - **MongoDB Atlas** или **PlanetScale** как внешние БД

### 3. Статические файлы
- Папка `web/` служится как статические файлы
- Папка `uploads/` для изображений товаров
- SPA routing настроен через `rewrites` в `vercel.json`

## Настройка деплоя

### 1. Подключите репозиторий к Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Import Git Repository
3. Выберите ваш репозиторий

### 2. Настройте переменные окружения
В настройках проекта на Vercel добавьте:

```
# Не требуется для базовой версии с mock данными
# Для интеграции с внешней БД добавьте:
DATABASE_URL=your_database_url
```

### 3. Деплой
- Push изменений в репозиторий автоматически запустит деплой
- Vercel автоматически определит конфигурацию из `vercel.json`

## Ограничения текущей версии

1. **Нет persistent хранилища**
   - Данные о товарах захардкожены
   - Нет возможности добавлять/редактировать товары

2. **Админ-панель временно не работает**
   - Требует аутентификации и базы данных
   - Нужна интеграция с внешней БД

3. **Загрузка файлов не работает**
   - Vercel не поддерживает persistent file storage
   - Решение: использовать внешний сервис (S3, Cloudinary)

## Рекомендации для Production

### 1. База данных
Выберите один из вариантов:
- **Vercel KV** - для простого key-value хранилища
- **Vercel Postgres** - для полноценной SQL БД
- **MongoDB Atlas** - NoSQL с бесплатным тарифом
- **Supabase** - PostgreSQL с API и аутентификацией

### 2. Хранилище файлов
- **Vercel Blob** - нативное решение от Vercel
- **Cloudinary** - для изображений с автооптимизацией
- **AWS S3** - универсальное хранилище

### 3. Аутентификация для админки
- **NextAuth.js** - если переписать на Next.js
- **Auth0** или **Clerk** - готовые решения
- **Supabase Auth** - если используете Supabase

## Telegram Bot

Бот не может работать на Vercel (требует long polling или webhook).

Варианты:
1. **Отдельный VPS** для бота (как описано в `ops/DEPLOY.md`)
2. **Использовать webhooks** вместо long polling
3. **Cloudflare Workers** для обработки webhook

## Проверка работы

После деплоя проверьте:
1. Откройте https://tolstovka.vercel.app
2. API endpoints:
   - https://tolstovka.vercel.app/api/categories
   - https://tolstovka.vercel.app/api/products
   - https://tolstovka.vercel.app/api/banners

## Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь что структура папок соответствует описанной
3. Проверьте CORS настройки если Mini App не работает