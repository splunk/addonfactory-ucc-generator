import styled, { css } from 'styled-components';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import { variables } from '@splunk/themes';
import Switch from '@splunk/react-ui/Switch';

export const FixedCheckboxRowWidth = css`
    width: 320px;
`;

export const StyledColumnLayout = styled(ColumnLayout)`
    ${FixedCheckboxRowWidth}
`;

export const CheckboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

export const StyledCollapsiblePanel = styled(CollapsiblePanel)`
    margin-top: ${variables.spacingXSmall};
    & > *:not(:last-child) {
        button {
            background-color: ${variables.neutral300} !important;
        }
        font-size: 14px;
        margin-bottom: ${variables.spacingXSmall};
        background-color: ${variables.neutral300};
    }
`;

export const RowContainer = styled.div`
    & > *:not(:last-child) {
        margin-bottom: ${variables.spacingSmall};
    }
    margin: 0 0 ${variables.spacingSmall} 28px;
`;

export const GroupLabel = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px ${variables.spacingSmall};
    background-color: ${variables.neutral300};
    font-size: 14px;
    margin: ${variables.spacingSmall} 0;
`;

export const Description = styled.span`
    padding-right: ${variables.spacingLarge};
    margin-left: ${variables.spacingSmall};
    font-size: 12px;
    display: flex;
    justify-content: end;
`;

export const CheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    input {
        margin-right: ${variables.spacingSmall};
    }
`;

export const StyledSwitch = styled(Switch)`
    padding: 0 3px;
    flex: min-content;
    align-items: center;
`;

export const StyledRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 2px;
`;
