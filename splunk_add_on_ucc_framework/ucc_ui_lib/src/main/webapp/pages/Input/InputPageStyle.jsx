import styled from 'styled-components';
import { variables } from '@splunk/themes';

export const TitleComponent = styled.div`
    font-size: ${variables.fontSizeXXLarge};
    margin-bottom: 20px;
`;

export const SubTitleComponent = styled.div`
    font-size: ${variables.fontSize};
    margin-bottom: 10px;
`;

export const TableCaptionComponent = styled.div`
    .table-caption-inner {
        text-align: left;
    }
`;
