import styled, { createGlobalStyle } from 'styled-components';
import { variables, mixins } from '@splunk/themes';
import Button from '@splunk/react-ui/Button';

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

export const GlobalBodyStyle = createGlobalStyle`
    body {
        background-color: ${variables.backgroundColorPage};
    }
`;

export { StyledContainer, StyledGreeting, StyledButton };
