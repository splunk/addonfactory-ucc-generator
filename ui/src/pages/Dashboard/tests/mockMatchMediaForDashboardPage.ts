import { vi } from 'vitest';

// needed for dashabord greater than 28.1.0
// type error is thrown if that one is not defined
// it can be done via test.setup.ts but then it is applied to all tests
// and it is causing issues with other tests

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

const dimensions = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
};
const mockBounding = vi.fn(() => ({
    ...dimensions,
    toJSON: vi.fn(() => dimensions),
}));

Element.prototype.getBoundingClientRect = mockBounding;
