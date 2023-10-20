import type { Meta, StoryObj } from '@storybook/react';
import AcceptModal from './AcceptModal';

const meta = {
    component: AcceptModal,
    title: 'Components/AcceptModal',
} satisfies Meta<typeof AcceptModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        title: 'Accept Modal Title',
        open: true,
        message: 'Some message',
        declineBtnLabel: 'Decline message',
        acceptBtnLabel: 'Accept message',
    },
};
