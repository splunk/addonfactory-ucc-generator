import styled, { css } from 'styled-components';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

export const FixedCheckboxRowWidth = css`
    width: 320px;
`;
export const StyledColumnLayout = styled(ColumnLayout)`
    ${FixedCheckboxRowWidth}
`;
