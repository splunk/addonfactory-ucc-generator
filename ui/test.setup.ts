import { afterAll, afterEach, beforeAll, beforeEach, MockInstance, vi } from 'vitest';
import '@testing-library/jest-dom';

import { configure } from '@testing-library/react';

import { server } from './src/mocks/server';
import './src/tests/expectExtenders';

global.URL.createObjectURL = vi.fn();

/*
 * Disabling `testing-library/no-unnecessary-act` here because our global test setup
 * may indirectly trigger React state updates in certain hooks/components during
 * initialization (e.g., MSW server setup, expect extenders, global mocks).
 * These can cause false positives for "unnecessary act" since they aren’t directly
 * related to test assertions, so we suppress the rule.
 */

/* eslint-disable testing-library/no-unnecessary-act */

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

// eslint-disable-next-line import/no-mutable-exports
export let consoleError: MockInstance<{
    (...data: unknown[]): void;
    (message?: unknown, ...optionalParams: unknown[]): void;
}>;

beforeEach(() => {
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error;
    consoleError = vi.spyOn(console, 'error');
    consoleError.mockImplementation((...args: Parameters<typeof console.error>) => {
        originalConsoleError(...args);
        // todo: will be resolved in the future
        // throw new Error(
        //     'Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.'
        // );
    });
});
