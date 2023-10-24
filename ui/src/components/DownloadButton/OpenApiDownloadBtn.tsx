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
                <div style={{ display: 'grid', justifyItems: 'center' }}>
                    <Icon />
                    <span style={{ fontSize: '9px' }}>Openapi.json</span>
                </div>
            </DownloadButton>
        </div>
    );
}

export default OpenApiDownloadButton;
