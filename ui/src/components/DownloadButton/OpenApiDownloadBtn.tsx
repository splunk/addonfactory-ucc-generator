import React from 'react';
import Icon from '@splunk/react-icons/ArrowBroadUnderbarDown';
import styled from 'styled-components';
import { getBuildDirPath } from '../../util/script';
import DownloadButton from './DownloadButton';

function OpenApiDownloadButton() {
    const StyledDiv = styled.div`
        text-overflow: ellipsis;
        overflow: hidden;
    `;
    return (
        <DownloadButton
            fileUrl={getBuildDirPath().replace('js/build', 'openapi.json')}
            fileNameAfterDownload="openapi.json"
        >
            <StyledDiv>
                <Icon />
                <span>OpenAPI.json</span>
            </StyledDiv>
        </DownloadButton>
    );
}

export default OpenApiDownloadButton;
