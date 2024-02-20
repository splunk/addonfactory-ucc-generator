import type { Meta, StoryObj } from '@storybook/react';
import MarkdownMessage from '../MarkdownMessage';

const meta = {
    component: MarkdownMessage,
    title: 'MarkdownMessage',
    parameters: {
        snapshots: {
            height: 200,
            width: 200,
        },
    },
} satisfies Meta<typeof MarkdownMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        markdownType: 'text',
        text: 'text',
        color: 'color',
    },
};
