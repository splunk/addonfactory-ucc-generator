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
        display: flex;
        align-items: center;
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
    min-width: 35px;
    align-items: center;
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

export const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
    appearance: none;
    width: 20px;
    min-width: 20px;
    height: 20px;
    min-height: 20px;
    border: 2px solid #6b7280;
    border-radius: 4px;
    background-color: #ffffff;
    cursor: pointer;
    display: inline-block;
    margin-right: 8px;
    position: relative;

    &:checked {
        background-color: #ffffff;
        border: 2px solid #6b7280;
    }

    &:checked::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: #6b7280;
        clip-path: polygon(
            35.75% 85.22%,
            100% 8.1%,
            90.27% 0.02%,
            34.25% 67.35%,
            5% 45%,
            0% 55.84%
        );
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    &[data-indeterminate='true']::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 2px;
        background-color: #6b7280;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 1px;
    }

    &:disabled {
        border-color: #d1d5db;
        background-color: #f9fafb;
        cursor: not-allowed;
    }
`;
