import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { peerDependencies } from './package.json';

const modulesNotToBundle = Object.keys(peerDependencies);

export default defineConfig({
    optimizeDeps: {
        include: ['styled-components'],
    },
    plugins: [
        react({
            jsxRuntime: 'classic',
        }),
        dts({
            tsconfigPath: 'tsconfig.app.json',
            outDir: 'dist/lib',
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
            fileName: 'index',
        },
        minify: false,
        emptyOutDir: true,
        commonjsOptions: {
            transformMixedEsModules: true,
            esmExternals: (id) => id === 'styled-components',
        },
        rollupOptions: {
            external: modulesNotToBundle,
            output: {
                format: 'module',
                dir: 'dist/lib',
                interop: 'compat',
            },
        },
    },
});
