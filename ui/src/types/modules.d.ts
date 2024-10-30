declare module '@splunk/splunk-utils/config';
declare module '@splunk/splunk-utils/url' {
    export type Sharing = '' | 'app' | 'global' | 'system';

    export interface NamespaceOptions {
        app?: string;
        owner?: string;
        sharing?: Sharing;
    }

    export interface ConfigOptions {
        /** Config options including `splunkdPath`. Defaults to the value provided by `@splunk/splunk-utils/config`. */
        splunkdPath?: string;
    }

    /**
     * Creates a fully qualified URL for the specified endpoint.
     * For example:
     * ```
     * createRESTURL('server/info'); // "/en-US/splunkd/__raw/services/server/info"
     * createRESTURL('saved/searches', {app: 'search'}); // "/en-US/splunkd/__raw/servicesNS/-/search/saved/searches"
     * ```
     * @param endpoint - An endpoint to a REST API.
     * @param namespaceOptions - Optional namespace options.
     * @param configOptions - Optional config options.
     * @returns The URL of the REST API endpoint.
     * @alias createRESTURL
     */
    export function createRESTURL(
        endpoint: string,
        namespaceOptions?: NamespaceOptions,
        configOptions?: ConfigOptions
    ): string;
}

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
