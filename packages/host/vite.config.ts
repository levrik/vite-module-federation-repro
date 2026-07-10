import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';

export default defineConfig({
    plugins: [
        federation({
            name: 'host',
            remotes: {
                remote: {
                    type: 'module',
                    name: 'remote',
                    entry: 'http://localhost:5001/remoteEntry.js'
                },
            },
            dts: false,
        }),
    ],
    server: {
        port: 5174,
    },
});
