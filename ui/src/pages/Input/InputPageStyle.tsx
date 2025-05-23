import styled from 'styled-components';
import variables from '@splunk/themes/variables';

export const TitleComponent = styled.div.attrs({
    className: 'pageTitle',
})`
    font-size: ${variables.fontSizeXXLarge};
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
`;

export const SubTitleComponent = styled.div.attrs({
    className: 'pageSubtitle',
})`
    font-size: ${variables.fontSize};
    margin-bottom: 10px;
`;

export const TableCaptionComponent = styled.div`
    .table-caption-inner {
        text-align: left;
    }
`;
