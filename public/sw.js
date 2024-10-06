const expectedCaches = [`3d-chess-v1`];

// Use the install event to pre-cache all initial resources.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(expectedCaches.at(-1));
      cache.addAll([
        "/board-WBQHAPHW.gltf",
        "/pawnv3-WMTUALHL.gltf",
        "/bishopv3-4YRUFXLK.gltf",
        "/knightv3-UB2HHP4W.gltf",
        "/rookv3-ELRYDWNO.gltf",
        "/queenv3-J76JIKCJ.gltf",
        "/kingv3-KRLCVILK.gltf",
        "/pawn-animation-GH4YVD7P.gltf",
        "/bishop-animation-5YBADP5H.gltf",
        "/knight-animation-FIC5EOG5.gltf",
        "/rook-animation-UXA6GLY5.gltf",
        "/queen-animation-A56RHX6J.gltf",
        "/click-2VCHPPVR.mp3",
        "/crumble-BBBHSYQE.mp3",
        "/tube-ZB5725HQ.png",
      ]);
    })()
  );
});

//Activation of service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      try {
        await Promise.all(
          cacheKeys.map((cacheKey) => {
            if (!expectedCaches.includes(cacheKey)) {
              return caches.delete(cacheKey);
            }
          })
        );
      } catch (e) {
        console.error(e);
      } finally {
        console.log("SW now ready to handle fetches!");
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (event.request.method !== "GET") {
        return;
      }
      const cache = await caches.open(expectedCaches.at(-1));
      // Get the resource from the cache.
      const cachedResponse = await cache.match(event.request);
      //If its not a 3d model or image or audio, then check if the resource is modified since cached
      if (
        event.request.url.endsWith(".gltf") ||
        event.request.url.endsWith(".png") ||
        event.request.url.endsWith(".mp3")
      ) {
        if (cachedResponse) {
          return cachedResponse;
        } else {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);
          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        }
      } else {
        const modifiedRequest = new Request(event.request);
        if (cachedResponse) {
          const lastModified = cachedResponse.headers.get("Last-Modified");
          modifiedRequest.headers.set("If-Modified-Since", lastModified);
        }
        const fetchResponse = await fetch(modifiedRequest);
        //If response 304, then the resource is not modified since cached
        if (response.status === 304) {
          return cachedResponse;
        }
        // Cache the new response
        cache.put(event.request, fetchResponse.clone());
        return fetchResponse;
      }
    })()
  );
});
