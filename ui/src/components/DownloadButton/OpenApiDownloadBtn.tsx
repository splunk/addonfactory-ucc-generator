import React from 'react';
import { getBuildDirPath } from '../../util/script';
import DownloadButton from './DownloadButton';

function OpenApiDownloadButton() {
    return (
        <DownloadButton
            fileUrl={getBuildDirPath().replace('js/build', 'openapi.json')}
            fileNameAfterDownload="openapi.json"
        />
    );
}

export default OpenApiDownloadButton;
