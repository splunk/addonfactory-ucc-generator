import React from 'react';
import { render, screen } from '@testing-library/react';
import DownloadButton from './DownloadButton';

describe('DownloadButton', () => {
    it('Check if download button displays content correctly', async () => {
        const exampleContent = {
            fileUrl: 'http://localhost:6006/index.json',
            buttonText: 'some btn text',
            fileNameAfterDownload: 'fileName',
        };

        render(<DownloadButton {...exampleContent} />);

        const downloadBtn: HTMLAnchorElement = screen.getByTestId('downloadButton');
        expect(downloadBtn).toBeInTheDocument();

        expect(downloadBtn).toHaveTextContent(exampleContent.buttonText);

        expect(downloadBtn.href).toEqual(exampleContent.fileUrl);

        expect(downloadBtn.download).toEqual(exampleContent.fileNameAfterDownload);
    });
});
