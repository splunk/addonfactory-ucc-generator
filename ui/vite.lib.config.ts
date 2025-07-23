import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { peerDependencies } from './package.json';

// styles-components needs to be bundled with the library
// as without that it throws error when test command used
const modulesNotToBundle = Object.keys(peerDependencies).filter(
    (dep) => dep !== 'styled-components'
);

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
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/publicApi.ts'),
            formats: ['es'],
            fileName: 'index',
        },
        commonjsOptions: {
            esmExternals: ['styled-components'],
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
