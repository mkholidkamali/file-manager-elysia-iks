import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 3001,
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..'],
        },
    },
    build: {
        // Improve source maps for better debugging
        sourcemap: true,
    },
});
