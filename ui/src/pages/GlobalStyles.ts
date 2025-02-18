import styled, { createGlobalStyle } from 'styled-components';
import { variables, mixins } from '@splunk/themes';

export const StyledContainer = styled.div`
    ${mixins.reset('inline')};
    display: block;
    font-size: ${variables.fontSizeLarge};
    line-height: 200%;
    margin: calc(${variables.spacing} * 1) calc(${variables.spacing} * 1);
`;

export const GlobalBodyStyle = createGlobalStyle`
    body {
        background-color: ${variables.backgroundColorPage};
        min-width: 960px;
    }

    /* Safari browser specific issue - https://stackoverflow.com/questions/21400182/safari-css-font-color-issue?noredirect=1&lq=1 */
    input[disabled],
    textarea[disabled],
    select[disabled='disabled'] {
        -webkit-text-fill-color: #c3cbd4
    }
`;
