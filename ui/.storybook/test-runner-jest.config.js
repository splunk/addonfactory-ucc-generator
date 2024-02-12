const { getJestConfig } = require('@storybook/test-runner');

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
    ...testRunnerConfig,
    /** Add your own overrides below, and make sure
     *  to merge testRunnerConfig properties with your own
     * @see https://jestjs.io/docs/configuration
     */
    testEnvironmentOptions: {
        ...testRunnerConfig.testEnvironmentOptions,
        'jest-playwright': {
            ...testRunnerConfig.testEnvironmentOptions['jest-playwright'],
            launchOptions: {
                channel: 'chrome',
                args: [
                    '--font-render-hinting=none',
                    '--disable-skia-runtime-opts',
                    '--disable-font-subpixel-positioning',
                    '--disable-lcd-text',
                ],
            },
        },
    },
};
