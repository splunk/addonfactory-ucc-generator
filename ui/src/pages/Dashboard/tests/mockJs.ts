Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: jest.fn(),
});

// needed for package import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset'
