import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import styledComponentBabelPlugin from './styled-component-babel-plugin';

export default defineConfig({
    optimizeDeps: {
        include: ['styled-components'],
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    // styledComponentBabelPlugin,
                    // [
                    //     'module-resolver',
                    //     {
                    //         alias: {
                    //             'styled-components': './styled-components.cjs', // <!-- cjs or js depending on your package.json `type: `
                    //         },
                    //     },
                    // ],
                ],
            },
        }),
        dts({
            tsconfigPath: 'tsconfig.app.json',
            outDir: 'dist/lib',
            rollupTypes: true,
            // include: ['src/types/*.d.ts', 'src/publicApi.ts'],
        }),
    ],
    base: '',
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/publicApi.ts'),
            formats: ['es'],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
            requireReturnsDefault: 'auto',
        },
        minify: false,
        emptyOutDir: true,
        rollupOptions: {
            // externalize deps that shouldn't be bundled into your library
            external: ['react', 'react-dom', 'styled-components'],
            output: {
                format: 'esm',
                dir: 'dist/lib',
                entryFileNames: 'index.js',
                chunkFileNames: '[name]-[hash].js',
                // https://github.com/styled-components/styled-components/issues/3700
                interop: 'auto',
            },
        },
    },
    resolve: {
        alias: {
            'styled-components': 'src/styled-components-shim.js',
        },
    },
});
