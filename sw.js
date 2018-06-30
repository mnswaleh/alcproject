/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const alc_cache = 'cache_A';
let urlsToCache = [
    './',
    './custom.css',
    './custom.js'
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
            caches.open(alc_cache)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(fromCache(event.request));
    event.waitUntil(
            update(event.request)
            .then(refresh)
            );
});
//fetch from cache
function fromCache(request) {
    return caches.open(alc_cache).then(function (cache) {
        return cache.match(request);
    });
}
//request for cache update
function update(request) {
    return caches.open(alc_cache).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response.clone()).then(function () {
                return response;
            });
        });
    });
}
//refresh page contents
function refresh(response) {
    return self.clients.matchAll().then(function (clients) {
        clients.forEach(function (client) {
            var message = {
                type: 'refresh',
                url: response.url,
                eTag: response.headers.get('ETag')
            };
            client.postMessage(JSON.stringify(message));
        });
    });
}


