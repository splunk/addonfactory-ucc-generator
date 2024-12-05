import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';
import { configure } from '@testing-library/react';

import { server } from './src/mocks/server';
import './src/tests/expectExtenders';

/**
 * Configure test attributes
 */
configure({ testIdAttribute: 'data-test' });

/**
 * MSW mocking
 */
beforeAll(() =>
    server.listen({
        onUnhandledRequest: 'warn',
    })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Failing tests if there is some console error during tests
 */
// eslint-disable-next-line import/no-mutable-exports
export let consoleError: jest.SpyInstance<void, Parameters<(typeof console)['error']>>;

beforeEach(() => {
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error;
    consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation((...args: Parameters<typeof console.error>) => {
        originalConsoleError(...args);
        throw new Error(
            'Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.'
        );
    });
});
