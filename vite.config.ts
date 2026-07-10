import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';

export default defineConfig({
    base: '/subpath',
    plugins: [
        federation({
            name: 'host',
            dts: false,
        }),
    ],
    server: {
        port: 5174,
        proxy: {
            '^/(?!subpath).*': {
                target: 'http://localhost:5174',
                rewrite: (path: string) => `/subpath${path}`,
                ws: true
            }
        }
    },
});
