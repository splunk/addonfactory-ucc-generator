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
        // using index.json as it needs to be from the same domain
        fileUrl: '/index.json',
        children: 'Download',
        fileNameAfterDownload: 'index.json',
    },
};
