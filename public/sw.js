/* global self ReadableStream Response */
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

const map = new Map();

self.addEventListener('message', (event) => {
    // We send a heartbeat every x second to keep the
    // service worker alive if a transferable stream is not sent
    if (event.data === 'ping') {
        return;
    }

    const data = event.data;
    const downloadUrl = data.url || self.registration.scope + Math.random() + '/' + (typeof data === 'string' ? data : data.filename);
    const port = event.ports[0];
    const metadata = new Array(3); // [stream, data, port]

    metadata[1] = data;
    metadata[2] = port;

    if (event.data.readableStream) {
        metadata[0] = event.data.readableStream;
    } else if (event.data.transferringReadable) {
        port.onmessage = (evt) => {
            port.onmessage = null;
            metadata[0] = evt.data.readableStream;
        };
    } else {
        metadata[0] = createStream(port);
    }

    map.set(downloadUrl, metadata);
    port.postMessage({ download: downloadUrl });
});

function createStream(port) {
    // ReadableStream is only supported by chrome 52
    return new ReadableStream({
        start(controller) {
            // When we receive data on the messageChannel, we write
            port.onmessage = ({ data }) => {
                if (data === 'end') {
                    return controller.close();
                }

                if (data === 'abort') {
                    controller.error('Aborted the download');
                    return;
                }

                controller.enqueue(data);
            };
        },
        cancel(reason) {
            console.log('user aborted', reason);
            port.postMessage({ abort: true });
        }
    });
}
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    if (url.endsWith('/ping')) {
        return event.respondWith(new Response('pong'));
    }

    // this only works for Firefox

    const hijacke = map.get(url);

    if (!hijacke) {
        if (!url.includes(self.registration.scope + 'webtorrent/')) {
            return null;
        } else if (url.includes(self.registration.scope + 'webtorrent/keepalive/')) {
            event.respondWith(new Response());
        } else if (url.includes(self.registration.scope + 'webtorrent/cancel/')) {
            event.respondWith(
                new Response(
                    new ReadableStream({
                        cancel() {
                            cancellable = true;
                        }
                    })
                )
            );
        } else {
            event.respondWith(serve(event));
        }
        return null;
    }
    const [stream, data, port] = hijacke;

    map.delete(url);

    // Not comfortable letting any user control all headers
    // so we only copy over the length & disposition
    const responseHeaders = new Headers({
        'Content-Type': 'application/octet-stream; charset=utf-8',

        // To be on the safe side, The link can be opened in a iframe.
        // but octet-stream should stop it.
        'Content-Security-Policy': "default-src 'none'",
        'X-Content-Security-Policy': "default-src 'none'",
        'X-WebKit-CSP': "default-src 'none'",
        'X-XSS-Protection': '1; mode=block',
        'Cross-Origin-Embedder-Policy': 'require-corp'
    });

    let headers = new Headers(data.headers || {});

    if (headers.has('Content-Length')) {
        responseHeaders.set('Content-Length', headers.get('Content-Length'));
    }

    if (headers.has('Content-Disposition')) {
        responseHeaders.set('Content-Disposition', headers.get('Content-Disposition'));
    }

    // data, data.filename and size should not be used anymore
    if (data.size) {
        console.warn('Depricated');
        responseHeaders.set('Content-Length', data.size);
    }

    let fileName = typeof data === 'string' ? data : data.filename;
    if (fileName) {
        console.warn('Depricated');
        // Make filename RFC5987 compatible
        fileName = encodeURIComponent(fileName).replace(/['()]/g, escape).replace(/\*/g, '%2A');
        responseHeaders.set('Content-Disposition', "attachment; filename*=UTF-8''" + fileName);
    }

    event.respondWith(new Response(stream, { headers: responseHeaders }));

    port.postMessage({ debug: 'Download started' });
});

async function serve({ request }) {
    const { url, method, headers, destination } = request;
    const clientlist = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    const [data, port] = await new Promise((resolve) => {
        // Use race condition for whoever controls the response stream
        for (const client of clientlist) {
            const messageChannel = new MessageChannel();
            const { port1, port2 } = messageChannel;
            port1.onmessage = ({ data }) => {
                resolve([data, port1]);
            };
            client.postMessage(
                {
                    url,
                    method,
                    headers: Object.fromEntries(headers.entries()),
                    scope: self.registration.scope,
                    destination,
                    type: 'webtorrent'
                },
                [port2]
            );
        }
    });

    let timeOut = null;
    const cleanup = () => {
        port.postMessage(false); // send a cancel request
        clearTimeout(timeOut);
        port.onmessage = null;
    };

    if (data.body !== 'STREAM') {
        cleanup();
        return new Response(data.body, data);
    }

    return new Response(
        new ReadableStream({
            pull(controller) {
                return new Promise((resolve) => {
                    port.onmessage = ({ data }) => {
                        if (data) {
                            controller.enqueue(data); // data is Uint8Array
                        } else {
                            cleanup();
                            controller.close(); // data is null, means the stream ended
                        }
                        resolve();
                    };
                    if (!cancellable) {
                        // firefox doesn't support cancelling of Readable Streams in service workers,
                        // so we just empty it after 5s of inactivity, the browser will request another port anyways
                        clearTimeout(timeOut);
                        if (destination !== 'document') {
                            timeOut = setTimeout(() => {
                                cleanup();
                                resolve();
                            }, portTimeoutDuration);
                        }
                    }
                    port.postMessage(true); // send a pull request
                });
            },
            cancel() {
                cleanup();
            }
        }),
        data
    );
}
