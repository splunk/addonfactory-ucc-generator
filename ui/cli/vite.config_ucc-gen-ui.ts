// vite.config.ts
import { defineConfig } from 'vite';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync, unlinkSync } from 'fs';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uiDir = __dirname.split('/node_modules')[0];

const DEBUG = process.env.NODE_ENV !== 'production';

// const proxyTargetUrl = 'http://localhost:8000';

// const jsAssetsRegex = /.+\/app\/.+\/js\/build\/custom(\/.+(js(.map)?))/;

// function isItStaticAsset(url: string): boolean {
//     return false;
// }

const entryDir = join(uiDir, 'src/ucc-ui-extensions');

// /**
//  * It looks for all index files in the given directory.
//  * @param {string} dir
//  * @return {string[]}
//  */
// function getAllIndexFiles(dir: string): string[] {
//     let results: string[] = [];
//     const list = readdirSync(dir);
//     list.forEach((file) => {
//         const filePath = join(dir, file);
//         const stat = statSync(filePath);
//         if (stat && stat.isDirectory()) {
//             results = results.concat(getAllIndexFiles(filePath));
//         } else if (file === 'index.ts' || file === 'index.tsx') {
//             results.push(filePath);
//         }
//     });
//     return results;
// }

// const entryFiles = getAllIndexFiles(entryDir);

// if (entryFiles.length === 0) {
//     throw new Error(
//         'No entry files found. Make sure the entryDir is correct and there are index files in some directory.'
//     );
// }

// Create input object for multiple entry points
const input: Record<string, string> = {};

// entryFiles.forEach((file) => {
//     const entryName = relative(entryDir, dirname(file));
//     input[entryName] = file;
// });

// Add the UCC UI entry point
input['ucc-ui'] = join(uiDir, 'src/ucc-ui.ts');

const TA_NAME = 'Splunk_TA_Example';
const outputDir = resolve(uiDir, '../output', TA_NAME, 'appserver/static/js/build');

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
                    // return Object.keys(input).includes(chunkInfo.name)
                    //     ? 'custom/[name].js'
                    //     :
                    //      DEBUG
                    //     ? '[name].js'
                    //     : '[name].[hash].js';
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
                        console.error(`Error deleting ${file}:`, err);
                    }
                });
            },
        },
        // {
        //     name: 'url-rewrite-middleware',
        //     configureServer(server) {
        //         server.middlewares.use((req, res, next) => {
        //             // if (req.url && isItStaticAsset(req.url)) {
        //             //     req.url = req.url.replace(jsAssetsRegex, '$1');
        //             // }
        //             next();
        //         });
        //     },
        // },
    ],
    // server: {
    //     proxy: {
    //         // Configure proxy based on URL pattern
    //         '/': {
    //             target: proxyTargetUrl,
    //             changeOrigin: true,
    //             bypass: ({ url }) => {
    //                 // Don't proxy static assets
    //                 // if (url && isItStaticAsset(url)) {
    //                 //     return url;
    //                 // }
    //                 return null; // Proxy everything else
    //             },
    //         },
    //     },
    // },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    base: '',
});
