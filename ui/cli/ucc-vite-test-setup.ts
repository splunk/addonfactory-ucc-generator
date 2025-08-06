/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';

import { beforeEach, MockInstance, vi } from 'vitest';

// eslint-disable-next-line import/no-mutable-exports
export let consoleError: MockInstance<{
    (...data: unknown[]): void;
    (message?: unknown, ...optionalParams: unknown[]): void;
}>;
// eslint-disable-next-line no-console
const originalConsoleError = console.error;
beforeEach(() => {
    consoleError = vi.spyOn(console, 'error');
    consoleError.mockImplementation((...args: Parameters<typeof console.error>) => {
        originalConsoleError(...args);
        throw new Error(
            `Console error was called. Call vi.spyOn(console, 'error').mockImplementation(() => {}) if this is expected.`
        );
    });
});
