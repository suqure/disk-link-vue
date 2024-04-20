import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default ({ mode }) =>
    defineConfig({
        base: './',
        esbuild: {
            pure: ['console.log'],
            drop: ['debugger']
        },
        plugins: [
            VitePWA({
                strategies: 'injectManifest',
                injectRegister: false,
                filename: 'sw.js',
                devOptions: {
                    enabled: true
                },
                injectManifest: {
                    injectionPoint: undefined
                },
                manifest: {
                    name: '随心传',
                    short_name: '随心传',
                    icons: [
                        { src: 'images/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                        { src: 'images/pwa-256x256.png', sizes: '256x256', type: 'image/png' },
                        { src: 'images/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
                    ]
                },
                registerType: 'autoUpdate',
                workbox: {
                    runtimeCaching: [
                        {
                            urlPattern: /(.*?)\.(js|css|ts)/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'js-css-cache'
                            }
                        },
                        {
                            urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'image-cache'
                            }
                        }
                    ]
                }
            }),
            vue()
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            proxy: {
                '/api': {
                    target: '后台服务地址',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '')
                }
            }
        },
        define: {
            'process.env': loadEnv(mode, process.cwd())
        }
    });
