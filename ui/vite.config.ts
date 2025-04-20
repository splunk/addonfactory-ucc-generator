/// <reference types="vitest" />
import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import license from 'rollup-plugin-license';
import type { ViteUserConfig as VitestUserConfigInterface } from 'vitest/config';

const proxyTargetUrl = 'http://localhost:8000';
const devServerPort = 5173;
const devServerUrl = `http://localhost:${devServerPort}`;

// Function to check if URL is requesting entry_page.js
const isEntryPageRequest = (url?: string) => url?.includes('/js/build/entry_page.js');

// Function to check if a path should be served locally and not proxied
const isLocalResource = (url?: string) => {
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

// the fix for Uncaught Error: @vitejs/plugin-react can't detect preamble. Something is wrong.
// try to remove if after updating to React 18 and check if HMR works without it
const reactHmrWorkaround = {
    name: 'react-refresh-preamble',
    apply: 'serve',
    resolveId(id) {
        if (id === 'virtual:react-refresh-preamble') {
            return '\0virtual:react-refresh-preamble';
        }
        return null;
    },
    load(id) {
        if (id === '\0virtual:react-refresh-preamble') {
            return `
            import RefreshRuntime from '/@react-refresh';
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
          `;
        }
        return null;
    },
    transform(code, id) {
        if (id.endsWith('src/pages/EntryPage.tsx')) {
            return {
                code: `import 'virtual:react-refresh-preamble';\n${code}`,
                map: null,
            };
        }
        return null;
    },
} satisfies PluginOption;

const vitestTestConfig: VitestUserConfigInterface = {
    test: {
        watch: false,
        globals: true,
        environment: 'jsdom',
        setupFiles: 'test.setup.ts',
        server: {
            deps: {
                inline: ['jspdf'],
            },
        },
        coverage: {
            all: true,
            provider: 'istanbul',
            reporter: ['text'],
            thresholds: {
                statements: 78.04,
                branches: 72.02,
                functions: 76.07,
                lines: 78.37,
            },
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/cypress/**',
                '**/.{idea,git,cache,output,temp}/**',
                '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
                '**/jest.polyfills.ts',
                '**/vite.lib.config.ts',
                '**/ucc-gen-build-ui.js',
                '**/vite.config_ucc-gen-ui.ts',
                '**/**.stories.**',
                '**/mockServiceWorker.js',
                '**/styleMock.js',
                /*
                 TYPES
                 */
                // *.d.ts files
                '**/\\.d\\.ts$',
                '**\\.types\\.ts$',
                '**/.eslintrc.cjs',
                '**/.storybook/**',
                '**/stories/**',
            ],
        },
    },
};

const splunkPathRewriter = {
    name: 'splunk-path-rewriter',
    configureServer(server) {
        // eslint-disable-next-line consistent-return
        server.middlewares.use((req, _res, next) => {
            if (!req.url) {
                return next();
            }
            /**
             * Entrypoint handling
             * http://localhost:5173/[..]/js/build/entry_page.js
             * to
             * http://localhost:5173/src/pages/EntryPage.tsx
             *
             */
            if (isEntryPageRequest(req.url)) {
                req.url = '/src/pages/EntryPage.tsx';
                return next();
            }

            next();
        });
    },
} satisfies PluginOption;

export default defineConfig(({ mode }) => {
    const DEBUG = mode !== 'production';
    return {
        base: '',
        plugins: [
            reactHmrWorkaround,
            react(),
            checker({
                typescript: {
                    tsconfigPath: 'tsconfig.app.json',
                },
            }),
            {
                ...license({
                    thirdParty: {
                        output: {
                            file: 'dist/build/licenses.txt',
                        },
                    },
                }),
                apply: 'build',
            },
            splunkPathRewriter,
        ],
        build: {
            outDir: 'dist/build',
            sourcemap: true, // sourcemap is added always but latter on not copied in backend code, to be deleted fully
            minify: !DEBUG,
            rollupOptions: {
                input: {
                    entry_page: 'src/pages/EntryPage.tsx',
                },
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].[hash].js',
                },
            },
            target: 'es2020',
        },
        resolve: {
            alias: {
                querystring: 'querystring-es3',
            },
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react/jsx-dev-runtime'],
        },
        server: {
            port: devServerPort,
            proxy: {
                '/': {
                    target: proxyTargetUrl,
                    changeOrigin: true,
                    configure: (proxy) => {
                        proxy.on('proxyRes', (proxyRes) => {
                            // Sometimes Splunk throws a 303 redirect with location to the proxy target (localhost:8000)
                            // We need to rewrite the location back to the dev server URL
                            if (proxyRes.headers.location?.startsWith(proxyTargetUrl)) {
                                const newLocation = proxyRes.headers.location.replace(
                                    proxyTargetUrl,
                                    devServerUrl
                                );
                                // eslint-disable-next-line no-param-reassign
                                proxyRes.headers.location = newLocation;
                            }
                        });
                    },
                    bypass: (req) => {
                        // Always serve local resources directly
                        if (isLocalResource(req.url)) {
                            return req.url;
                        }

                        // Proxy everything else
                        return undefined;
                    },
                },
            },
        },
        test: vitestTestConfig.test,
    };
});
