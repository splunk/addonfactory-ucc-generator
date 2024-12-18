import styled, { css } from 'styled-components';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import { pick, variables } from '@splunk/themes';
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
            background-color: ${pick({
                enterprise: variables.neutral300,
                prisma: variables.neutral200,
            })} !important;
        }
        font-size: 14px;
        margin-bottom: ${variables.spacingXSmall};
        background-color: ${pick({
            enterprise: variables.neutral300,
            prisma: variables.neutral200,
        })};
        display: flex;
        align-items: center;
        align-content: center;
        // for prisma styling
        & > span {
            align-content: center;
        }
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
    background-color: ${pick({
        enterprise: variables.neutral300,
        prisma: variables.neutral200,
    })};
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
    border-radius: 2px;
    background-color: ${pick({
        enterprise: variables.backgroundColor,
        prisma: variables.backgroundColor,
    })};
    cursor: pointer;
    display: inline-block;
    position: relative;
    border: 1px solid
        ${pick({
            enterprise: variables.contentColorMuted,
            prisma: variables.contentColorMuted,
        })};

    &:checked {
        background-color: ${pick({
            enterprise: variables.backgroundColor,
            prisma: variables.focusColor,
        })};
        border: none;
    }

    &:checked::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: ${pick({
            enterprise: variables.textColor,
            prisma: variables.white,
        })};
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

    &[data-indeterminate='true'] {
        background-color: ${pick({
            enterprise: variables.backgroundColor,
            prisma: variables.focusColor,
        })};
    }

    &[data-indeterminate='true']::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 2px;
        background-color: ${pick({
            enterprise: variables.textColor,
            prisma: variables.white,
        })};
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 1px;
    }

    &:disabled {
        border: 1px solid ${variables.borderColorWeak};
        border: 1px solid
            ${pick({
                enterprise: variables.borderColorWeak,
                prisma: variables.contentColorDisabled,
            })};
        background-color: ${pick({
            enterprise: variables.backgroundColor,
            prisma: variables.backgroundColorDialog,
        })};
        cursor: not-allowed;
    }

    &:disabled[data-indeterminate='true']::after,
    &:disabled[checked]::after {
        background-color: ${pick({
            enterprise: variables.borderColorWeak,
            prisma: variables.contentColorMuted,
        })};
    }
`;
