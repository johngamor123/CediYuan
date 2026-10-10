"use strict";

const CACHE_NAME = "cediyuan-cache-v1";

const APP_FILES = [
"./",
"./index.html",
"./style.css",
"./app.js",
"./manifest.json"
];

// Save the main website files.
self.addEventListener("install", function (event) {
event.waitUntil(
caches.open(CACHE_NAME).then(function (cache) {
return cache.addAll(APP_FILES);
})
);

self.skipWaiting();
});

// Remove older CediYuan caches.
self.addEventListener("activate", function (event) {
event.waitUntil(
caches.keys().then(function (cacheNames) {
return Promise.all(
cacheNames
.filter(function (cacheName) {
return (
cacheName.startsWith("cediyuan-cache-") &&
cacheName !== CACHE_NAME
);
})
.map(function (cacheName) {
return caches.delete(cacheName);
})
);
})
);

self.clients.claim();
});

// Load saved app files when possible.
self.addEventListener("fetch", function (event) {
if (event.request.method !== "GET") {
return;
}

const requestURL = new URL(event.request.url);

if (requestURL.origin !== self.location.origin) {
return;
}

event.respondWith(
fetch(event.request)
.then(function (response) {
if (response && response.ok) {
const responseCopy = response.clone();

      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, responseCopy);
      });
    }

    return response;
  })
  .catch(function () {
    return caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }

      return new Response("You are offline. Please reconnect to the internet.", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    });
  })

);
});