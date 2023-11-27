import React from 'react';
import Icon from '@splunk/react-icons/ArrowBroadUnderbarDown';
import { getBuildDirPath } from '../../util/script';
import DownloadButton from './DownloadButton';

function OpenApiDownloadButton() {
    return (
        <div>
            <DownloadButton
                fileUrl={getBuildDirPath().replace('js/build', 'openapi.json')}
                fileNameAfterDownload="openapi.json"
            >
                <Icon />
                <span>OpenAPI.json</span>
            </DownloadButton>
        </div>
    );
}

export default OpenApiDownloadButton;
