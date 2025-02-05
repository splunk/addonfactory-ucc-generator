import styled, { css } from 'styled-components';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import { pick, variables } from '@splunk/themes';
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
    & > *:not(:last-child) {
        // expander
        [data-test='toggle'] {
            background-color: ${pick({
                enterprise: variables.neutral300,
            })};
        }
        // checkbox
        [data-test='button'] {
            ${CheckboxInHeader}
        }
        margin-bottom: ${variables.spacingXSmall};
        background-color: ${pick({
            enterprise: variables.neutral300,
            prisma: variables.neutral200,
        })};
        display: flex;
        align-items: center;
        // for prisma styling
        & > span {
            align-content: center;
        }
    }
`;

export const RowContainer = styled.div`
    margin: 0 0 ${variables.spacingSmall}
        ${pick({
            enterprise: '30px',
            prisma: '53px',
        })};
`;

export const GroupLabel = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px ${variables.spacingSmall};
    background-color: ${pick({
        enterprise: variables.neutral300,
        prisma: variables.neutral200,
    })};

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
