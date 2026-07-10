import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';

export default defineConfig({
    plugins: [
        vue(),
        federation({
            name: 'host',
            remotes: {
                remote: {
                    type: 'module',
                    name: 'remote',
                    entry: 'http://localhost:5001/remoteEntry.js'
                },
            },
            shared: {
                vue: {
                    singleton: true,
                    // Uncomment this line and the build will fail
                    // import: 'vue/dist/vue.esm-bundler.js',
                },
            },
            dts: false,
        }),
    ],
    server: {
        port: 5174,
    },
    build: {
        minify: false,
    },
});
