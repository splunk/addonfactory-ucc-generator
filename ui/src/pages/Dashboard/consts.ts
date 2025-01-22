import { FeatureFlags, Preset } from '@splunk/dashboard-context';

/**
 * Feature flags for the dashboard.
 *
 * enableSmartSourceDS - enables to reference job search results in other searches
 * here usage is, if 0 results then apply default data, if any results then ignore
 * https://splunkui.splunk.com/Packages/dashboard-docs/Smartsources
 *
 */

export const FEATURE_FLAGS = {
    enableSmartSourceDS: true,
} satisfies FeatureFlags & ConstructorParameters<typeof Preset>[0]['featureFlags'];
