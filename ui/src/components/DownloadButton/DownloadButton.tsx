import React, { ReactElement } from 'react';
import Button from '@splunk/react-ui/Button';
import Link from '@splunk/react-ui/Link';

interface DownloadButtonProps {
    // needs to be same domain if not it will just open link
    fileUrl: string;
    fileNameAfterDownload: string;
    children: ReactElement | ReactElement[] | string;
}

function DownloadButton(props: DownloadButtonProps) {
    return (
        <Link
            target="_blank"
            to={props.fileUrl}
            rel="noopener noreferrer"
            download={props.fileNameAfterDownload}
            data-test="downloadButton"
        >
            <Button>{props.children}</Button>
        </Link>
    );
}

export default DownloadButton;
