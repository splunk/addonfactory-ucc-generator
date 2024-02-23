import type { Meta, StoryObj } from '@storybook/react';
import ErrorModal from '../ErrorModal';

const meta = {
    component: ErrorModal,
    title: 'ErrorModal',
} satisfies Meta<typeof ErrorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        message: 'Error message',
        open: true,
    },
};
