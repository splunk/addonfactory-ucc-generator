import React from 'react';
import Button from '@splunk/react-ui/Button';

interface DownloadButtonProps {
    // needs to be same domain
    fileUrl: string;
    buttonText: string;
    fileNameAfterDownload: string;
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
            <Button>{props.buttonText} </Button>
        </a>
    );
}

export default DownloadButton;
