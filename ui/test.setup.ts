import { afterAll, afterEach, beforeAll, beforeEach, MockInstance, vi } from 'vitest';
import '@testing-library/jest-dom';

import { configure } from '@testing-library/react';

import { server } from './src/mocks/server';
import './src/tests/expectExtenders';

global.URL.createObjectURL = vi.fn();

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
    vi.resetAllMocks();
    server.resetHandlers();
});
afterAll(() => server.close());

/**
 * Failing tests if there is some console error during tests
 */

// Capture the real console.error once, before any spies are installed,
// to avoid infinite recursion when vitest 4 reuses spy references.
// eslint-disable-next-line no-console
const originalConsoleError = console.error;

// eslint-disable-next-line import/no-mutable-exports
export let consoleError: MockInstance<{
    (...data: unknown[]): void;
    (message?: unknown, ...optionalParams: unknown[]): void;
}>;

beforeEach(() => {
    consoleError = vi.spyOn(console, 'error');
    consoleError.mockImplementation((...args: Parameters<typeof console.error>) => {
        originalConsoleError(...args);
    });
});
