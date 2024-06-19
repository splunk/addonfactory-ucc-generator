import React from 'react';
import { getBuildDirPath } from '../../util/script';
import DownloadButton from './DownloadButton';

const fileUrl = getBuildDirPath().replace('js/build', 'openapi.json');

function OpenApiDownloadButton() {
    return (
        <DownloadButton fileUrl={fileUrl} fileNameAfterDownload="openapi.json">
            OpenAPI.json
        </DownloadButton>
    );
}

export default OpenApiDownloadButton;
