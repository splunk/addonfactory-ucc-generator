import type { Preview } from '@storybook/react';
import { initialize, mswDecorator, mswLoader } from 'msw-storybook-addon';
import { SplunkThemeProvider } from '@splunk/themes';
import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { StyledContainer, ThemeProviderSettings } from '../src/main/webapp/pages/EntryPageStyle';
import { WaitSpinnerWrapper } from '../src/main/webapp/components/table/CustomTableStyle';

import React from 'react';
import { serverHandlers } from '../src/main/webapp/mocks/server-handlers';
import { rest } from 'msw';

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
    },
    decorators: [
        (story) => (
            <SplunkThemeProvider // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                {...ThemeProviderSettings}
            >
                <StyledContainer>
                    <Router>
                        <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                            {story()}
                        </Suspense>
                    </Router>
                </StyledContainer>
            </SplunkThemeProvider>
        ),
        mswDecorator,
    ],
};

export default preview;
