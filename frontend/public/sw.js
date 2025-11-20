// ОБНОВЛЕННЫЙ Service Worker - НЕ кеширует HTML!
const CACHE_NAME = 'tolsovka-v2-20251008' // Новая версия кеша!
const CACHE_URLS = [
  '/manifest.json',
  'https://telegram.org/js/telegram-web-app.js'
]

// API endpoints НЕ кешируем
const API_CACHE_PATTERNS = []

// Image cache patterns
const IMAGE_CACHE_PATTERNS = [
  /^\/uploads\//,
  /\.(?:png|gif|jpg|jpeg|webp|svg)$/
]

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing v2...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching essential resources')
        return cache.addAll(CACHE_URLS)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
      .catch(err => {
        console.error('[SW] Installation failed:', err)
      })
  )
})

// Activate event - УДАЛЯЕМ старые кеши
self.addEventListener('activate', event => {
  console.log('[SW] Activating v2...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete, old caches deleted')
        return self.clients.claim()
      })
  )
})

// Fetch event - HTML НИКОГДА не кешируем!
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }
  
  // HTML - ВСЕГДА с сервера, БЕЗ кеша!
  if (request.headers.get('accept')?.includes('text/html') || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .catch(() => caches.match('/'))
    )
    return
  }
  
  // API - ВСЕГДА с сервера
  if (url.pathname.startsWith('/api')) {
    event.respondWith(fetch(request, { cache: 'no-store' }))
    return
  }
  
  // JS/CSS из assets - можно кешировать (с хешами)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetched = fetch(request).then(response => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then(c => c.put(request, response.clone()))
          }
          return response
        })
        return cached || fetched
      })
    )
    return
  }
  
  // Изображения - кеш с обновлением
  if (shouldCacheImage(request)) {
    event.respondWith(handleImageRequest(request))
    return
  }
  
  // Всё остальное - сеть первая
  event.respondWith(
    fetch(request, { cache: 'no-store' })
      .catch(() => caches.match(request))
  )
})

function shouldCacheImage(request) {
  const url = new URL(request.url)
  return IMAGE_CACHE_PATTERNS.some(pattern => 
    pattern.test(url.pathname) || pattern.test(url.href)
  )
}

async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to load image:', request.url)
    return new Response('', { status: 404 })
  }
}

// Handle updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('[SW] Service Worker v2 loaded - HTML не кешируется!')
