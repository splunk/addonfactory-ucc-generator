import React from 'react';

import layout from '@splunk/react-page';
import { SplunkThemeProvider } from '@splunk/themes';

import { defaultTheme } from '@splunk/splunk-utils/themes';

import TestComponent from '../../components/TestComponent';
import { StyledContainer, StyledGreeting } from './StartStyles';

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

layout(
    <SplunkThemeProvider {...themeProviderSettings}>
        <StyledContainer>
            <StyledGreeting>Hello, from inside Inputs!</StyledGreeting>
            <div>Your component will appear below.</div>
            <TestComponent name="from inside TestComponent" />
        </StyledContainer>
    </SplunkThemeProvider>
);
