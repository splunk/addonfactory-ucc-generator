// vite.config.ts
import { defineConfig } from 'vite';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { unlinkSync } from 'fs';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { globSync } from 'glob';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const uiDir = dirName.split('/node_modules')[0];

const DEBUG = process.env.NODE_ENV !== 'production';

// Create input object for multiple entry points
const input: Record<string, string> = {};

// Add the UCC UI entry point
input['ucc-ui'] = join(uiDir, 'src/ucc-ui.ts');

const TA_NAME = 'Splunk_TA_Example';

const paramOutputDir = process.argv.find((arg) => arg.startsWith('output='))?.slice(7);

const outputDir = paramOutputDir
    ? resolve(paramOutputDir, './output', TA_NAME, 'appserver/static/js/build')
    : resolve(uiDir, '../output', TA_NAME, 'appserver/static/js/build');

export default defineConfig({
    build: {
        outDir: outputDir,
        sourcemap: false,
        assetsDir: '',
        minify: true,
        rollupOptions: {
            input,
            output: {
                format: 'es',
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'ucc-ui') {
                        return 'entry_page.js';
                    }
                    return DEBUG ? '[name].js' : '[name].[hash].js';
                },
            },
        },
    },
    logLevel: 'info',
    plugins: [
        react(),
        checker({
            typescript: true,
        }),
        // Custom plugin to handle URL rewriting (equivalent to setupMiddlewares)
        {
            name: 'clean-specific-files',
            buildStart: async () => {
                // Use glob to find the specific file types
                const files = globSync([
                    `${outputDir}/**/*.js`,
                    `${outputDir}/**/*.js.map`,
                    `${outputDir}/**/*.txt`,
                ]);

                // Delete each file
                files.forEach((file) => {
                    try {
                        unlinkSync(file);
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error(`Error deleting ${file}:`, err);
                    }
                });
            },
        },
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    base: '',
});
