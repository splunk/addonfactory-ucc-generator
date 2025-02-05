declare module '@splunk/splunk-utils/config' {
    export const CSRFToken: string | null;
    export function getCSRFToken(): string | null;
    export const isAvailable: boolean;
    export function extractAppName(pathname?: string): string | undefined;
    export const app: string | undefined;
    export const appBuild: string | undefined;
    export const buildNumber: number | undefined;
    export const buildPushNumber: number | undefined;
    export const config: Record<string, unknown> | undefined;
    export const locale: string | undefined;
    export const portNumber: number | undefined;
    export const rootPath: string | undefined;
    export const serverTimezoneInfo: string | undefined;
    export const splunkdPath: string | undefined;
    export const username: string | undefined;
    export const versionLabel: string | undefined;
}

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
declare module '@splunk/splunk-utils/fetch' {
    export interface FetchInit {
        method: string;
        credentials: RequestCredentials;
        headers: Record<string, string>;
    }

    export const defaultFetchInit: FetchInit;

    export function getDefaultFetchInit(): FetchInit;

    export interface ErrorMessage {
        type: 'ERROR' | 'FATAL' | 'risky_command';
        text: string;
    }

    export interface ResponseData {
        messages?: ErrorMessage[];
    }

    export function findErrorMessage(response?: ResponseData): ErrorMessage | undefined;

    export function handleResponse(
        expectedStatus: number | number[]
    ): (res: Response) => Promise<unknown>;

    export function handleError(defaultMessage: string): (res: Response) => Promise<never>;
}

declare module '@splunk/search-job';
// declaring modules as utils does not seem to have types

declare module '@splunk/ui-utils/i18n';
declare module 'uuid';
