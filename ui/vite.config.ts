import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: resolve(__dirname, 'tsconfig.lib.json'),
            include: 'src/types/*.d.ts',
        }),
    ],
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/publicApi.ts'),
            formats: ['es'],
        },
        rollupOptions: {
            // externalize deps that shouldn't be bundled into your library
            external: ['react', 'react-dom'],
            output: {
                dir: 'dist/lib',
                entryFileNames: 'index.js',
                chunkFileNames: '[name]-[hash].js',
            },
        },
    },
});
