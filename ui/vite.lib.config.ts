import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
    optimizeDeps: {
        include: ['@splunk/themes'],
    },
    plugins: [
        react(),
        dts({
            tsconfigPath: resolve(__dirname, 'tsconfig.lib.json'),
            rollupTypes: true,
        }),
    ],
    base: '',
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/publicApi.ts'),
            name: 'ucc-ui',
            formats: ['es'],
            fileName: 'ucc-ui',
        },
        minify: false,
        commonjsOptions: {
            transformMixedEsModules: true,
            requireReturnsDefault: 'auto',
        },
        emptyOutDir: true,
        rollupOptions: {
            // externalize deps that shouldn't be bundled into your library
            external: ['react'],
            output: {
                dir: 'dist/lib',
                entryFileNames: 'index.js',
                chunkFileNames: '[name]-[hash].js',
            },
        },
    },
});
