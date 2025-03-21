import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { serverHandlers } from '../src/mocks/server-handlers';
import { http, HttpResponse } from 'msw';
import { withSplunkThemeToolbar } from './withSplunkTheme';

// Initialize MSW
initialize({
    serviceWorker: {
        url: './mockServiceWorker.js',
    },
    onUnhandledRequest(req) {
        const url = req.url;
        const skipList = [
            'bundle.js',
            'hot-update.js',
            'http://localhost:6006/index.json',
            '.woff',
        ];
        const shouldRequestBeBypassed = skipList.some((passItem) => url.includes(passItem));
        if (!shouldRequestBeBypassed) {
            console.warn('Found an unhandled %s request to %s', req.method, url);
        }
    },
});

const preview: Preview = {
    parameters: {
        loaders: [mswLoader],
        backgrounds: {
            disable: true,
        },
        msw: {
            handlers: {
                common: [
                    ...serverHandlers,
                    http.get(`globalConfig.json`, () =>
                        HttpResponse.json({
                            pages: {},
                            meta: {},
                        })
                    ),
                    http.post(`/servicesNS/:user/-/:serviceName`, async ({ request }) =>
                        HttpResponse.json(
                            {
                                messages: [
                                    {
                                        text: `Submitted body: ${decodeURIComponent(
                                            await request.text()
                                        )}`,
                                    },
                                ],
                            },
                            { status: 500 }
                        )
                    ),
                ],
            },
        },
        controls: {
            sort: 'requiredFirst',
        },
    },
    globalTypes: {
        family: {
            name: 'Family',
            description: 'Family',
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
            toolbar: {
                title: 'Color Scheme',
                icon: 'circlehollow',
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
            toolbar: {
                icon: 'circlehollow',
                items: [
                    { value: true, title: 'Animation on' },
                    { value: false, title: 'Animation off' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        family: 'enterprise',
        colorScheme: 'light',
        density: 'comfortable',
        animation: true,
    },
    loaders: [mswLoader],
    decorators: [withSplunkThemeToolbar],
};

export default preview;
