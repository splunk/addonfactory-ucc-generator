import type { StorybookConfig } from '@storybook/react-vite';
import { createRequire } from 'module';
import * as path from 'path';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
    stories: [
        {
            titlePrefix: 'Components',
            directory: '../src/components',
        },
        {
            titlePrefix: 'Pages',
            directory: '../src/pages',
        },
        {
            titlePrefix: 'Users Playground',
            directory: '../src/customentity/',
        },
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-a11y',
        '@kickstartds/storybook-addon-jsonschema',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    staticDirs: ['../src/public', './assets'],
    viteFinal: async (config) => {
        const { mergeConfig } = await import('vite');

        const alias = config.resolve?.alias || {};
        return mergeConfig(config, {
            resolve: {
                ...config.resolve,
                alias: {
                    ...alias,
                    'msw/native': require.resolve(
                        path.resolve(import.meta.dirname, '../node_modules/msw/lib/native/index.mjs')
                    ),
                    'msw/node': require.resolve(
                        path.resolve(import.meta.dirname, '../node_modules/msw/lib/node/index.mjs')
                    ),
                },
                optimizeDeps: {
                    include: ['storybook-dark-mode'],
                },
                viteConfigPath: '../vite.config.ts',
            },
        });
    },
    typescript: {
        check: true,
    },
};
export default config;
