import type { Meta, StoryObj } from '@storybook/react';
import HelpLinkComponent from '../HelpLinkComponent';

const meta = {
    component: HelpLinkComponent,
    title: 'HelpLinkComponent',
} satisfies Meta<typeof HelpLinkComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        controlOptions: {
            text: 'example text',
            link: 'example/reflink',
        },
    },
};
