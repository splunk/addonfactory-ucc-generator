import { vi } from 'vitest';

export class MockCustomRenderable {
    navigator = vi.fn<(arg0: unknown) => void>();

    render = vi.fn().mockReturnValue(undefined);
}
