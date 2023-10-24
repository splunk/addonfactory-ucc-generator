import React, { ReactElement } from 'react';
import Button from '@splunk/react-ui/Button';

interface DownloadButtonProps {
    // needs to be same domain if not it will just open link
    fileUrl: string;
    fileNameAfterDownload: string;
    children: ReactElement | string;
}

function DownloadButton(props: DownloadButtonProps) {
    return (
        <a
            target="_blank"
            href={props.fileUrl}
            rel="noopener noreferrer"
            download={props.fileNameAfterDownload}
            data-test="downloadButton"
        >
            <Button>{props.children}</Button>
        </a>
    );
}

export default DownloadButton;
