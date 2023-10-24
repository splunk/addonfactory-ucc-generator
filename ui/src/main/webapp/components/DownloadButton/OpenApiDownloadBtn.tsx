import React from 'react';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { app } from '@splunk/splunk-utils/config';
import DownloadButton from './DownloadButton';

function OpenApiDownloadButton() {
    return (
        <div style={{ float: 'right' }}>
            <DownloadButton
                fileUrl={createRESTURL('static/openapi.json', {
                    app,
                    owner: 'nobody',
                })}
                buttonText="Download openapi.json"
                fileNameAfterDownload="openapi.json"
            />
        </div>
    );
}

export default OpenApiDownloadButton;
