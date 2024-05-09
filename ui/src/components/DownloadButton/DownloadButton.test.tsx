import React from 'react';
import { render, screen } from '@testing-library/react';
import DownloadButton from './DownloadButton';

it('Check if download button displays content correctly', async () => {
    const exampleContent = {
        fileUrl: 'http://localhost:6006/index.json',
        fileNameAfterDownload: 'fileName',
    };

    render(<DownloadButton {...exampleContent} />);

    const downloadBtn: HTMLAnchorElement = screen.getByTestId('downloadButton');
    expect(downloadBtn).toBeInTheDocument();

    const label = screen.getByText('OpenAPI.json');
    expect(label).toBeInTheDocument();

    expect(downloadBtn.href).toEqual(exampleContent.fileUrl);

    expect(downloadBtn.download).toEqual(exampleContent.fileNameAfterDownload);
});
