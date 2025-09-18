# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Обзор

Проект «TOLSOVKA» — Telegram Mini App с приоритетом mobile-first (десктоп-верстка не требуется) и бэкендом на VPS. В репозитории присутствуют ассеты (папка DESIGN) и кодовая структура сервера и веб-заглушек.

Ключевые директории (высокоуровнево):
- server — серверная часть (Express, Telegraf, SQLite, загрузки).
- web — статика Mini App и админки (заглушки для начала).
- uploads — каталог для изображений товаров/баннеров на VPS (раздаётся напрямую Nginx и сервером).
- ops — инфраструктурные файлы (пример nginx.conf).
- DESIGN — исходные графические материалы (логотипы, шрифты и пр.).

## Команды (Windows PowerShell)

- Установка зависимостей сервера:

```powershell
npm install --prefix server
```

- Запуск сервера (по умолчанию на :8080):

```powershell
$env:PORT=8080; $env:BASE_URL='https://tolsovka.vercel.app'; npm --prefix server run dev
```

- Переменные окружения: скопируйте server/.env.example в server/.env и заполните значения (PORT, BASE_URL, SESSION_SECRET, DATABASE_FILE, ADMIN_CONFIG, BOT_TOKEN, MANAGER_USERNAME).

- Запуск бота (если задан BOT_TOKEN):

```powershell
node server/bot.js
```

- Проверка здоровья API:

```powershell
Invoke-WebRequest http://localhost:8080/api/health | Select-Object -ExpandProperty Content
```

## Архитектура (big picture)

- Mini App: mobile-first, открывается из Telegram по web_app; главная с баннерами (12:5), выбор категорий над лентой, сетка карточек 3:4, карточка товара с галереей и кнопкой «Купить» (модалка: @dmitriy_mityuk + копирование /p/{id}).
- Бот: /start с Inline («О нас», «Доставка», «Обратная связь», «Назад»), нижняя кнопка «Каталог» (web_app) открывает главную Mini App.
- Сервер: Express на VPS, статика из /web и /uploads, API для категорий/товаров/баннеров, админка на /admin.
- Данные/медиа: SQLite для сущностей, файлы изображений на диске VPS (/uploads). Seed-файлы категорий/товаров лежат в server/seed, тестовые картинки в uploads/seed.
- Инфраструктура: Nginx (TLS) проксирует трафик на сервер; /uploads отдаётся напрямую.

## Заметки по разработке

- Mobile-first: ориентируйтесь на Telegram WebApp (десктоп-верстка не требуется).
- Секреты (токен бота и пр.) всегда через переменные окружения, не коммитить.
- Для сидов: изображения для p_seed_01/02/03 уже скопированы в uploads/seed; при необходимости заменить на другие.
