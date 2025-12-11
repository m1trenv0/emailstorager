// Basic Service Worker for PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.')
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Let the browser handle all fetch requests
  event.respondWith(fetch(event.request))
})
