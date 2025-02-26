import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import checker from 'vite-plugin-checker';
import license from 'rollup-plugin-license';

const proxyTargetUrl = 'http://localhost:8000';
const devServerPort = 5173;
const devServerUrl = `http://localhost:${devServerPort}`;

// Function to check if URL is requesting entry_page.js
const isEntryPageRequest = (url: string) => url && url.includes('/js/build/entry_page.js');

// Function to check if a path should be served locally and not proxied
const isLocalResource = (url: string) => {
    return (
        url &&
        // Source files
        (url.startsWith('/src/') ||
            // Node modules and Vite dependencies
            url.includes('/node_modules/') ||
            url.includes('/@fs/') ||
            url.includes('/@vite/') ||
            url.includes('/@id/') ||
            url.includes('/@react-refresh') ||
            // Entry point file
            isEntryPageRequest(url))
    );
};

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
            // Custom plugin for path rewriting
            {
                name: 'splunk-path-rewriter',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (!req.url) return next();

                        // Entry point handling
                        if (isEntryPageRequest(req.url)) {
                            console.log(`Serving entry_page.js for: ${req.url}`);
                            req.url = '/src/pages/EntryPage.tsx';
                            return next();
                        }

                        // Handle localized source paths
                        const localeSourceMatch = req.url.match(/^\/[a-z]{2}-[A-Z]{2}(\/.+)$/);
                        if (localeSourceMatch) {
                            const actualPath = localeSourceMatch[1];
                            if (isLocalResource(actualPath)) {
                                console.log(
                                    `Rewriting localized path: ${req.url} -> ${actualPath}`
                                );
                                req.url = actualPath;
                            }
                        }

                        next();
                    });
                },
            },
            {
                name: 'full-reload',
                enforce: 'post',
                handleHotUpdate({ server, file }) {
                    console.log('File changed:', file);

                    server.ws.send({ type: 'full-reload' });
                    return [];
                },
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
        optimizeDeps: {
            // Force Vite to pre-bundle these dependencies
            include: ['react', 'react-dom', 'react/jsx-dev-runtime'],
            // Ensure optimization happens at startup
            force: true,
        },
        server: {
            port: devServerPort,
            fs: {
                // Allow serving files from more paths
                allow: ['.', './node_modules', '../node_modules'],
                strict: false,
            },
            //https://github.com/vitejs/vite-plugin-react/issues/11 the issue is still reproducible
            hmr: {
                clientPort: devServerPort, // Ensure correct port is used
                timeout: 10000, // Increase timeout for slower systems
            },
            watch: {
                // Ensure all files are watched correctly
                usePolling: true,
            },
            proxy: {
                '/': {
                    target: proxyTargetUrl,
                    changeOrigin: true,
                    configure: (proxy) => {
                        // Handle redirects
                        proxy.on('proxyRes', (proxyRes, req, res) => {
                            if (
                                proxyRes.headers.location &&
                                proxyRes.headers.location.startsWith(proxyTargetUrl)
                            ) {
                                const newLocation = proxyRes.headers.location.replace(
                                    proxyTargetUrl,
                                    devServerUrl
                                );
                                proxyRes.headers.location = newLocation;
                                console.log(
                                    `Rewritten redirect: ${proxyRes.headers.location} -> ${newLocation}`
                                );
                            }
                        });
                    },
                    bypass: (req) => {
                        if (!req.url) return undefined;

                        // Always serve local resources directly
                        if (isLocalResource(req.url)) {
                            return req.url;
                        }

                        // Check if a localized path should be served locally
                        const localeMatch = req.url.match(/^\/[a-z]{2}-[A-Z]{2}(\/.+)$/);
                        if (localeMatch && isLocalResource(localeMatch[1])) {
                            return req.url;
                        }

                        // Proxy everything else
                        return undefined;
                    },
                },
            },
        },
    };
});
