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

declare module '@splunk/splunk-utils/themes' {
    interface ThemeOptions {
        family: 'enterprise' | 'prisma';
        colorScheme: 'light' | 'dark';
        density: 'comfortable';
    }

    interface ThemeMap {
        enterprise: ThemeOptions;
        enterpriseDark: ThemeOptions;
        light: ThemeOptions;
        dark: ThemeOptions;
        prismaLight: ThemeOptions;
        prismaDark: ThemeOptions;
        lite: ThemeOptions;
    }

    /**
     * Determines a default theme name based on the current environment.
     * @deprecated Use getUserTheme instead.
     * @param scope - The environment.
     */
    export function defaultTheme(scope?: Window | null): string;

    /**
     * Determines the user theme name based on Splunk Core theme precedence.
     * @throws If the theme API is not available.
     */
    export function getUserTheme(): Promise<keyof ThemeMap>;

    /**
     * Get theme options for ThemeProvider
     * @param theme - Theme name
     */
    export function getThemeOptions(theme: string): ThemeOptions;
}

declare module '@splunk/search-job';

declare module '@splunk/react-page' {
    import * as React from 'react';

    /**
     * A React element used as a placeholder for the app bar while the navigation bar is loading.
     */
    export const AppBar: React.FC;

    /**
     * A React element used as a placeholder for the splunk bar while the navigation bar is loading.
     */
    export const SplunkBar: React.FC;

    export interface RenderOptions {
        /**
         * Changes the page title.
         */
        pageTitle?: string;
        /**
         * Hides the app bar.
         * @default false
         */
        hideAppBar?: boolean;
        /**
         * Hides the app list in the Splunk bar.
         * @default false
         * @deprecated It is in the docs, but not used in the source code
         */
        hideAppsList?: boolean;
        /**
         * Renders only the main content, hiding the Splunk bar, app bar, and footer.
         * @default false
         */
        hideChrome?: boolean;
        /**
         * Hides the footer.
         * @default false
         * @deprecated It is in the docs, but not used in the source code
         */
        hideFooter?: boolean;
        /**
         * Hides the Splunk bar.
         * @default false
         */
        hideSplunkBar?: boolean;
        /**
         * Set to `fixed` to fix all navigation bars to the edge of the page.
         * @default 'scrolling'
         */
        layout?: 'scrolling' | 'fixed';
        /**
         * Wraps elements in @splunk/react-ui's LayerStackGlobalProvider.
         * @default true
         */
        useGlobalLayerStack?: boolean;
        /**
         * Used to theme UI elements.
         * @default 'light'
         */
        theme?: 'light' | 'dark';
        /**
         * Configures the loader used for the loading the layout.
         * @default 'scriptjs'
         */
        loader?: 'scriptjs' | 'requirejs';
        /**
         * Prioritizes loading the React element and lazily fetches and compiles the layout API (navigation bar).
         * @default false
         */
        lazyLoadLayout?: boolean;
        /**
         * A React element used as a placeholder for the splunk bar while the navigation bar is loading.
         * @default SplunkBar
         */
        SplunkBarFallback?: React.FC;
        /**
         * A React element used as a placeholder for the app bar while the navigation bar is loading.
         * @default AppBar
         */
        AppBarFallback?: React.FC;
        /**
         * A callback function which executes after layout API is fetched and compiled.
         */
        onLayoutComplete?: () => void;
        /**
         * A callback function which executes once the layout starts to render.
         */
        onLayoutStart?: (containers: {
            headerContainer: HTMLDivElement;
            bodyContainer: HTMLDivElement;
        }) => void;
    }

    /**
     * Renders a React element into the Layout API.
     * @public
     * @param element - A React element.
     * @param options - Optional rendering options.
     */
    function render(
        element: React.ReactNode,
        options?: RenderOptions
    ): {
        unmount: () => boolean;
    };

    export default render;
}
declare module '@splunk/ui-utils/i18n';
declare module 'uuid';
