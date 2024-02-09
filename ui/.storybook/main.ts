import type { StorybookConfig } from '@storybook/react-webpack5';
import * as custom from '../webpack.config.js';
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
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    staticDirs: ['../src/public'],
    webpackFinal: async (config) => {
        const alias = config.resolve?.alias || {};
        return {
            ...config,
            resolve: {
                ...config.resolve,
                ...custom.resolve,
                alias: {
                    ...alias,
                    'msw/native': require.resolve(
                        path.resolve(__dirname, '../node_modules/msw/lib/native/index.mjs')
                    ),
                    'msw/node': require.resolve(
                        path.resolve(__dirname, '../node_modules/msw/lib/node/index.mjs')
                    ),
                },
            },
        };
    },
    typescript: {
        check: true,
    },
};
export default config;
