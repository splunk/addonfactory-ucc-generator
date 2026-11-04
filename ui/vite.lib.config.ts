import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { createRequire } from 'node:module';
import { peerDependencies } from './package.json';
import type dependencyManifestFactory from './cli/dependency-manifest.cjs';

const dependencyManifest: typeof dependencyManifestFactory = createRequire(import.meta.url)(
    './cli/dependency-manifest.cjs'
);

// styles-components needs to be bundled with the library
// as without that it throws error when test command used
const modulesNotToBundle = Object.keys(peerDependencies).filter(
    (dep) => dep !== 'styled-components'
);

const collector = dependencyManifest({ producer: 'ucc-ui', library: true });

export default defineConfig({
    plugins: [
        { ...collector, generateBundle: { order: 'post', handler: collector.generateBundle } },
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
