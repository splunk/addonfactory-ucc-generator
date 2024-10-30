import type { Config } from 'jest';

export default {
    // Mock
    clearMocks: true,
    // env settings
    setupFiles: ['<rootDir>/jest.polyfills.ts'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/src/main/resources'],
    restoreMocks: true,
    // Coverage
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/stories/',
        // ignore *.d.ts files
        '\\.d\\.ts$',
        'mockServiceWorker.js',
        'styleMock.js',
    ],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            statements: 65,
            branches: 56,
            functions: 64,
            lines: 65,
        },
    },
    testEnvironmentOptions: {
        /**
         * @note Opt-out from JSDOM using browser-style resolution
         * for dependencies. This is simply incorrect, as JSDOM is
         * not a browser, and loading browser-oriented bundles in
         * Node.js will break things.
         *
         * Consider migrating to a more modern test runner if you
         * don't want to deal with this.
         */
        customExportConditions: [''],
    },
    errorOnDeprecated: true,
    moduleNameMapper: {
        // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
        uuid: require.resolve('uuid'),
        '\\.(css)$': '<rootDir>/src/mocks/styleMock.js',
    },
    transformIgnorePatterns: ['node_modules/@splunk/dashboard-presets/EnterpriseViewOnlyPreset'],
} satisfies Config;
