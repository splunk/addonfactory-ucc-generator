import React, { ReactElement } from 'react';
import Button from '@splunk/react-ui/Button';
import ArrowBroadUnderbarDown from '@splunk/react-icons/ArrowBroadUnderbarDown';

interface DownloadButtonProps {
    // needs to be same domain if not it will just open link
    fileUrl: string;
    fileNameAfterDownload: string;
    children: ReactElement | ReactElement[] | string;
}

function DownloadButton(props: DownloadButtonProps) {
    return (
        <Button
            target="_blank"
            to={props.fileUrl}
            download={props.fileNameAfterDownload}
            data-test="downloadButton"
            icon={<ArrowBroadUnderbarDown />}
        >
            {props.children}
        </Button>
    );
}

export default DownloadButton;
