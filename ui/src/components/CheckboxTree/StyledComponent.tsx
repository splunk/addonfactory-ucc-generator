import styled, { css } from 'styled-components';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import variables from '@splunk/themes/variables';
import pick from '@splunk/themes/pick';
import Switch from '@splunk/react-ui/Switch';

const CheckboxInHeader = css`
    align-self: center;
    background-color: ${pick({
        enterprise: variables.neutral100,
    })};
`;

export const CheckboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

export const StyledCollapsiblePanel = styled(CollapsiblePanel)`
    // for collapsible button
    & > div > button[data-test='toggle'][aria-controls] {
        border: 0;
        margin-right: ${variables.spacingSmall} !important;
        all: unset;
        cursor: pointer;
    }

    & > *:not(:last-child) {
        // for parent checkbox
        button[data-test='toggle'][data-selected='false'] {
            background-color: ${variables.neutral100};
        }
        display: flex;
        align-items: center;
        // for prisma styling
        & > span {
            align-content: center;
        }
        background-color: ${variables.neutral200};
        &:hover:not([disabled]) {
            background-color: ${variables.neutral300};
            box-shadow: none;
        }
    }
    background-color: transparent;
`;

export const RowContainer = styled.div`
    margin: 0 0 0
        ${pick({
            enterprise: '30px',
            prisma: '45px',
        })};
`;

export const GroupLabel = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px ${variables.spacingSmall};
    background-color: ${variables.neutral200};
    &:hover:not([disabled]) {
        background-color: ${variables.neutral300};
    }

    button {
        ${CheckboxInHeader}
    }
`;

const HeaderTextColor = pick({
    enterprise: variables.textColor,
    prisma: variables.contentColorActive,
});

export const SelectionCounter = styled.div`
    font-size: ${variables.fontSizeSmall};
    text-align: right;
    align-content: center;
    flex-shrink: 0;
    color: ${HeaderTextColor};
`;

export const StyledSwitch = styled(Switch)`
    color: ${HeaderTextColor};
    flex-shrink: 1;
`;
