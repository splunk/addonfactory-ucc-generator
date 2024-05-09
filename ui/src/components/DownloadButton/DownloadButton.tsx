import React from 'react';
import Button from '@splunk/react-ui/Button';
import { _ as i18n } from '@splunk/ui-utils/i18n';
import Icon from '@splunk/react-icons/ArrowBroadUnderbarDown';
import styled from 'styled-components';

interface DownloadButtonProps {
    // needs to be same domain if not it will just open link
    fileUrl: string;
    fileNameAfterDownload: string;
}

function DownloadButton(props: DownloadButtonProps) {
    const StyledDiv = styled.div`
        text-overflow: ellipsis;
        overflow: hidden;
    `;

    return (
        <Button
            target="_blank"
            to={props.fileUrl}
            download={props.fileNameAfterDownload}
            data-test="downloadButton"
            label={i18n(
                <StyledDiv>
                    <Icon />
                    <span>OpenAPI.json</span>
                </StyledDiv>
            )}
        />
    );
}

export default DownloadButton;
