import type { StorybookConfig } from '@storybook/react';
import * as path from 'path';

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
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-a11y',
        '@kickstartds/storybook-addon-jsonschema',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    core: {
        builder: '@storybook/builder-vite', // 👈 The builder enabled here.
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
                        path.resolve(__dirname, '../node_modules/msw/lib/native/index.mjs')
                    ),
                    'msw/node': require.resolve(
                        path.resolve(__dirname, '../node_modules/msw/lib/node/index.mjs')
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
