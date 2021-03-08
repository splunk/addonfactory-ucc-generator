import React from 'react';
import layout from '@splunk/react-page';
import { SplunkThemeProvider } from '@splunk/themes';
import { defaultTheme } from '@splunk/splunk-utils/themes';

import { StyledContainer } from './entryPageStyle';
import ConfigManager from '../util/configManager';
import InputPage from './Input/InputPage';
import ConfigurationPage from './Configuration/ConfigurationPage';

const defaultThemeSplunkThemeProviderMap = {
    enterprise: {
        family: 'enterprise',
        colorScheme: 'light',
        density: 'comfortable',
    },
    enterpriseDark: {
        family: 'enterprise',
        colorScheme: 'dark',
        density: 'comfortable',
    },
    lite: {
        family: 'enterprise',
        colorScheme: 'light',
        density: 'comfortable',
    },
};

const themeProviderSettings =
    defaultThemeSplunkThemeProviderMap[defaultTheme()] ||
    defaultThemeSplunkThemeProviderMap.enterprise;

const url = window.location.pathname;
const urlParts = url.substring(1).split('/');
const page = urlParts[urlParts.length - 1];

if (page === 'inputs') {
    layout(
        <SplunkThemeProvider {...themeProviderSettings}>
            <StyledContainer>
                <ConfigManager>
                    {({loading, appData}) => {
                        return !loading && appData && <InputPage isInput serviceName="" />
                    }}
                </ConfigManager>
            </StyledContainer>
        </SplunkThemeProvider>,
        { pageTitle: 'Inputs' }
    );
} else if (page === 'configuration') {
    layout(
        <SplunkThemeProvider {...themeProviderSettings}>
            <StyledContainer>
                <ConfigManager>
                    {({loading, appData}) => {
                        return !loading && appData && <ConfigurationPage />
                    }}
                </ConfigManager>
            </StyledContainer>
        </SplunkThemeProvider>,
        { pageTitle: 'Configuration' }
    );
}
