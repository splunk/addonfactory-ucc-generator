import type { Preview } from '@storybook/react';
import { initialize, mswDecorator, mswLoader } from 'msw-storybook-addon';
import { serverHandlers } from '../src/mocks/server-handlers';
import { rest } from 'msw';
import { withSplunkThemeToolbar } from './withSplunkTheme';

// Initialize MSW
initialize({
    onUnhandledRequest(req) {
        const { href } = req.url;
        const skipList = ['bundle.js', 'hot-update.js', 'http://localhost:6006/index.json'];
        const shouldRequestBeBypassed = skipList.some((passItem) => href.includes(passItem));
        if (!shouldRequestBeBypassed) {
            console.warn('Found an unhandled %s request to %s', req.method, href);
        }
    },
});

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^handle.*' },
        loaders: [mswLoader],
        backgrounds: {
            disable: true,
        },
        msw: {
            handlers: [
                ...serverHandlers,
                rest.get(`globalConfig.json`, (req, res, ctx) =>
                    res(
                        ctx.json({
                            pages: {},
                            meta: {},
                        })
                    )
                ),
            ],
        },
        controls: {
            sort: 'requiredFirst',
        },
    },
    decorators: [withSplunkThemeToolbar, mswDecorator],
};

export const globalTypes: Preview['globalTypes'] = {
    family: {
        name: 'Family',
        description: 'Family',
        defaultValue: 'enterprise',
        toolbar: {
            icon: 'circlehollow',
            type: 'return',
            items: [
                { value: 'enterprise', icon: 'circlehollow', title: 'Enterprise' },
                { value: 'prisma', icon: 'circle', title: 'Prisma' },
            ],
            showName: true,
            dynamicTitle: true,
        },
    },
    colorScheme: {
        name: 'Color Scheme',
        description: 'Color Scheme',
        defaultValue: 'light',
        toolbar: {
            items: [
                { value: 'light', left: 'left', icon: 'sun', title: 'Light' },
                { value: 'dark', icon: 'moon', title: 'Dark' },
            ],
            showName: true,
            dynamicTitle: true,
        },
    },
    density: {
        name: 'Density',
        description: 'Density',
        defaultValue: 'comfortable',
        toolbar: {
            items: [
                { value: 'comfortable', icon: 'grid', title: 'Comfortable' },
                { value: 'compact', icon: 'component', title: 'Compact' },
            ],
            dynamicTitle: true,
        },
    },
    animation: {
        name: 'Animation',
        description: 'Animation',
        defaultValue: true,
        toolbar: {
            icon: 'circlehollow',
            items: [
                { value: true, title: 'Animation on' },
                { value: false, title: 'Animation off' },
            ],
            dynamicTitle: true,
        },
    },
};

export default preview;
