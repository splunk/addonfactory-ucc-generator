import styled from 'styled-components';
import { variables, mixins } from '@splunk/themes';
import { defaultTheme } from '@splunk/splunk-utils/themes';

const StyledContainer = styled.div`
    ${mixins.reset('inline')};
    display: block;
    font-size: ${variables.fontSizeLarge};
    line-height: 200%;
    margin: calc(${variables.spacing} * 1) calc(${variables.spacing} * 1);
`;

const StyledGreeting = styled.div`
    font-weight: bold;
    color: ${variables.infoColor};
    font-size: ${variables.fontSizeXXLarge};
`;

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

const ThemeProviderSettings =
    defaultThemeSplunkThemeProviderMap[defaultTheme()] ||
    defaultThemeSplunkThemeProviderMap.enterprise;

export { StyledContainer, StyledGreeting, ThemeProviderSettings };
