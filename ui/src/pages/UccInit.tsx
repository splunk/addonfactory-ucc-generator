import React from 'react';
import layout from '@splunk/react-page';
import { getUserTheme, ThemeMap } from '@splunk/splunk-utils/themes';

import { PAGE_CONF, PAGE_DASHBOARD, PAGE_INPUT } from '../constants/pages';
import messageDict from '../constants/messageDict';
import { AppProviders } from './AppProviders';

const InputPage = React.lazy(
    () => import(/* webpackChunkName: "input-page", webpackPrefetch: true */ './Input/InputPage')
);
const ConfigurationPage = React.lazy(
    () =>
        import(
            /* webpackChunkName: "configuration-page", webpackPrefetch: true */ './Configuration/ConfigurationPage'
        )
);
const DashboardPage = React.lazy(
    () =>
        import(
            /* webpackChunkName: "dashboard-page", webpackPrefetch: true */ './Dashboard/DashboardPage'
        )
);

const url = window.location.pathname;
const urlParts = url.substring(1).split('/');
const page = urlParts[urlParts.length - 1];

// eslint-disable-next-line no-console
console.log(`
UCC Framework is here 👋 If you encounter any issues or have feedback, please report them to us.

For Splunkers, reach out via our Slack channel: #ucc-framework.
For external users, join us at: https://splunk-usergroups.slack.com/archives/C03SG3ZL4S1.

We appreciate your help in making UCC better! 🚀`);

function getNormalizedTheme(theme: keyof ThemeMap) {
    if (theme.toLowerCase().includes('dark')) {
        return 'dark';
    }
    return 'light';
}

export async function init() {
    return getUserTheme().then((userTheme) => {
        const theme = getNormalizedTheme(userTheme);
        switch (page) {
            case PAGE_INPUT:
                layout(
                    <AppProviders>
                        <InputPage />
                    </AppProviders>,
                    { pageTitle: messageDict[116], theme }
                );
                break;
            case PAGE_CONF:
                layout(
                    <AppProviders>
                        <ConfigurationPage />
                    </AppProviders>,
                    { pageTitle: messageDict[117], theme }
                );
                break;
            case PAGE_DASHBOARD:
                layout(
                    <AppProviders>
                        <DashboardPage />
                    </AppProviders>,
                    { pageTitle: messageDict[119], theme }
                );
                break;
            default:
        }
    });
}
