import type { Meta, StoryObj } from '@storybook/react';
import PlaceholderComponent from './PlaceholderComponent';

const meta = {
    component: PlaceholderComponent,
    title: 'Components/PlaceholderComponent',
} satisfies Meta<typeof PlaceholderComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        controlOptions: {
            defaultValue: 'default value',
        },
    },
};
