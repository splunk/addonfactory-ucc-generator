/* eslint-env node */
module.exports = {
    // Mock
    clearMocks: true,

    // env settings
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/src/main/resources'],

    // Coverage
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    coverageDirectory: 'coverage',
};
