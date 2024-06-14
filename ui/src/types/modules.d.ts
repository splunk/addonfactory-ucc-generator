declare module '@splunk/splunk-utils/config';
declare module '@splunk/splunk-utils/url';
declare module '@splunk/search-job';
// declaring modules as utils does not seem to have types

declare module '@splunk/ui-utils/i18n';
declare module 'uuid';

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchImageSnapshot(): R;
        }
    }
}
