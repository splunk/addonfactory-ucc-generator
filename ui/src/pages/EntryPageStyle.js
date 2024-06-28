import styled from 'styled-components';
import { variables, mixins } from '@splunk/themes';
import Button from '@splunk/react-ui/Button';
import { defaultTheme } from '@splunk/splunk-utils/themes';
import { getUserTheme } from '@splunk/splunk-utils/themes';

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

const StyledButton = styled(Button)`
    min-width: 80px;
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

let themeProviderSettings = defaultThemeSplunkThemeProviderMap[defaultTheme];
const getThemeProviderSettings = () => themeProviderSettings;

getUserTheme().then((theme) => {
    const isDarkTheme = theme === 'dark';

    document.body.style.backgroundColor = isDarkTheme ? '#171d21' : '#ffffff';
    themeProviderSettings = isDarkTheme
        ? defaultThemeSplunkThemeProviderMap.enterpriseDark
        : defaultThemeSplunkThemeProviderMap[defaultTheme];
});

export { StyledContainer, StyledGreeting, getThemeProviderSettings, StyledButton };
