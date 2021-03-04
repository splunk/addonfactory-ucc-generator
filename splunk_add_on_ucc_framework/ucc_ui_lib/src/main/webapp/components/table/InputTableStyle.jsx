import styled from 'styled-components';
import Button from '@splunk/react-ui/Button';
import { variables } from '@splunk/themes';

export const ButtonComponent = styled(Button)`
    margin: 0px 5px;
`;

export const TitleComponent = styled.div`
    font-size: ${variables.fontSizeXXLarge};
`;

export const SubTitleComponent = styled.div`
    font-size: ${variables.fontSize};
`;

export const TableCaptionComponent = styled.div`
    .table-caption-inner {
        text-align: left;
    }
`;
