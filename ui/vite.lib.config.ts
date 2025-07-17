import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { peerDependencies } from './package.json';

const modulesNotToBundle = Object.keys(peerDependencies);

export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: 'tsconfig.app.json',
            outDir: 'dist/lib',
            rollupTypes: true,
        }),
    ],
    build: {
        minify: false,
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/publicApi.ts'),
            formats: ['es'],
            fileName: 'index',
        },
        emptyOutDir: true,
        rollupOptions: {
            external: modulesNotToBundle,
            output: {
                format: 'module',
                dir: 'dist/lib',
            },
        },
    },
});
