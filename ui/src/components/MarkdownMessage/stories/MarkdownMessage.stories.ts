import type { Meta, StoryObj } from '@storybook/react';
import MarkdownMessage from '../MarkdownMessage';

const meta = {
    component: MarkdownMessage,
    title: 'MarkdownMessage',
} satisfies Meta<typeof MarkdownMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        text: 'text',
        link: 'link',
        color: 'color',
        markdownType: 'text',
        token: 'token',
        linkText: 'linkText',
    },
};
