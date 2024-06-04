Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: jest.fn(),
});
