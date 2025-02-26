import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import checker from 'vite-plugin-checker';
import license from 'rollup-plugin-license';

const proxyTargetUrl = 'http://localhost:8000';
const devServerUrl = 'http://localhost:5173';

export default defineConfig(({ mode }) => {
    const DEBUG = mode !== 'production';

    return {
        plugins: [
            react(),
            checker({ typescript: true }),
            {
                ...license({
                    thirdParty: {
                        output: {
                            file: resolve(__dirname, 'dist/build/licenses.txt'),
                        },
                    },
                }),
                apply: 'build',
            },
        ],
        build: {
            outDir: 'dist/build',
            sourcemap: true,
            rollupOptions: {
                input: {
                    entry_page: resolve(__dirname, 'src/pages/EntryPage.tsx'),
                },
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].[hash].js',
                },
            },
            minify: !DEBUG ? 'esbuild' : false,
            target: 'es2020',
        },
        resolve: {
            alias: {
                querystring: 'querystring-es3',
            },
        },
    };
});
