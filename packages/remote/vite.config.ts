import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';

export default defineConfig({
    plugins: [
        federation({
            name: 'remote',
            filename: 'remoteEntry.js',
            exposes: {
                '.': './src/index.ts',
            },
            dts: false,
        }),
    ],
    server: {
        port: 5001,
        cors: true,
    },
});
