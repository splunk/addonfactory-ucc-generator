import React from 'react';
import layout from '@splunk/react-page';
import { getUserTheme, ThemeMap } from '@splunk/splunk-utils/themes';

import { PAGE_CONF, PAGE_DASHBOARD, PAGE_INPUT } from '../constants/pages';
import messageDict from '../constants/messageDict';
import { AppProviders } from './AppProviders';
import { CustomElementsMap } from '../types/CustomTypes';
import { CustomComponentContextProvider } from '../context/CustomComponentContext';

const InputPage = React.lazy(() => import('./Input/InputPage'));
const ConfigurationPage = React.lazy(() => import('./Configuration/ConfigurationPage'));
const DashboardPage = React.lazy(() => import('./Dashboard/DashboardPage'));

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

export async function uccInit(components?: CustomElementsMap) {
    return getUserTheme().then((userTheme) => {
        const theme = getNormalizedTheme(userTheme);
        switch (page) {
            case PAGE_INPUT:
                layout(
                    <AppProviders>
                        <CustomComponentContextProvider customComponents={components}>
                            <InputPage />
                        </CustomComponentContextProvider>
                    </AppProviders>,
                    { pageTitle: messageDict[116], theme }
                );
                break;
            case PAGE_CONF:
                layout(
                    <AppProviders>
                        <CustomComponentContextProvider customComponents={components}>
                            <ConfigurationPage />
                        </CustomComponentContextProvider>
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
