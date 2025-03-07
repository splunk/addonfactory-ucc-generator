import { afterAll, afterEach, beforeAll, beforeEach, vi, MockInstance } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';

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
beforeEach(() => {
    vi.clearAllMocks();
});
afterEach(() => {
    server.resetHandlers();
    cleanup();
});
afterAll(() => server.close());

/**
 * Failing tests if there is some console error during tests
 */
// eslint-disable-next-line import/no-mutable-exports
export let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error;
    consoleError = vi.spyOn(console, 'error');
    consoleError.mockImplementation((...args: Parameters<typeof console.error>) => {
        originalConsoleError(...args);
        throw new Error(
            'Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.'
        );
    });
});
