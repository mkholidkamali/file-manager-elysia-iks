import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { createHash } from 'crypto';

// Bypass Node.js version check for Bun
// process.versions.node = '20.19.0';

// Polyfill for crypto.hash in Bun environment
if (typeof crypto !== 'undefined') {
    // Define custom crypto interface with hash method
    interface CustomCrypto extends Crypto {
        hash?: (algorithm: string, data: Uint8Array, outputFormat: 'hex' | 'base64') => string;
    }
    
    // Apply the polyfill
    (globalThis.crypto as CustomCrypto).hash = (algorithm, data, outputFormat) => {
        return createHash(algorithm).update(data).digest(outputFormat as 'hex' | 'base64');
    };
}

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
