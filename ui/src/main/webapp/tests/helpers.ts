export class MockCustomRenderable {
    navigator = jest.fn<void, [unknown]>();

    render = jest.fn().mockReturnValue(undefined);
}

export function mockCustomMenu() {
    jest.resetModules();

    const mockCustomMenuInstance = new MockCustomRenderable();
    jest.mock(
        '/custom/CustomMenu.js',
        () =>
            (
                globalConfig: unknown,
                target: HTMLElement,
                navigator: MockCustomRenderable['navigator']
            ) => {
                mockCustomMenuInstance.navigator = navigator;
                return mockCustomMenuInstance;
            },
        { virtual: true }
    );
    jest.mock('/custom/Hook.js', () => () => {}, { virtual: true });
    jest.mock('/custom/PrivateEndpointInput.js', () => () => new MockCustomRenderable(), {
        virtual: true,
    });

    return {
        mockCustomMenuInstance,
    };
}
