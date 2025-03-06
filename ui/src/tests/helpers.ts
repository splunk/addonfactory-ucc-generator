import { vi } from 'vitest';
import { MockCustomRenderable } from './MockCustomRenderable';

let mockCustomMenuInstance: MockCustomRenderable;

vi.mock('/custom/Hook.js', () => {
    return {
        default: vi.fn(),
    };
});

vi.mock('/custom/PrivateEndpointInput.js', () => {
    return {
        default: vi.fn().mockImplementation(() => new MockCustomRenderable()),
    };
});

vi.mock('/custom/CustomMenu.js', () => {
    return {
        default: vi.fn().mockImplementation((globalConfig, target, navigator) => {
            mockCustomMenuInstance.navigator = navigator;
            return mockCustomMenuInstance;
        }),
    };
});

export function mockCustomMenu() {
    vi.resetModules();

    mockCustomMenuInstance = new MockCustomRenderable();
    mockCustomMenuInstance.navigator = vi.fn();
    mockCustomMenuInstance.render = vi.fn().mockReturnValue(undefined);

    return {
        mockCustomMenuInstance,
    };
}
