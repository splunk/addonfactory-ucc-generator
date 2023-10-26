import React from 'react';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { app } from '@splunk/splunk-utils/config';
import Icon from '@splunk/react-icons/ArrowBroadUnderbarDown';
import DownloadButton from './DownloadButton';

function OpenApiDownloadButton() {
    return (
        <div style={{ float: 'right' }}>
            <DownloadButton
                fileUrl={createRESTURL('static/openapi.json', {
                    app,
                    owner: 'nobody',
                })}
                fileNameAfterDownload="openapi.json"
            >
                <Icon />
                <span>OpenAPI.json</span>
            </DownloadButton>
        </div>
    );
}

export default OpenApiDownloadButton;
