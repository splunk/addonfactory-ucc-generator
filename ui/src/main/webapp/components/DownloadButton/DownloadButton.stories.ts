import type { Meta, StoryObj } from '@storybook/react';
import DownloadButton from './DownloadButton';

const meta = {
    component: DownloadButton,
    title: 'Components/DownloadButton',
} satisfies Meta<typeof DownloadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        // using index.json as it needs to be fromt he same domain
        fileUrl: 'http://localhost:6006/index.json',
        buttonText: 'Download',
        fileNameAfterDownload: 'index.json',
    },
};
