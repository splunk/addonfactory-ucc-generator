import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import AcceptModal from '../AcceptModal';

const meta = {
    component: AcceptModal,
    title: 'AcceptModal',
} satisfies Meta<typeof AcceptModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleRequestClose: fn(),
        returnFocus: fn(),
        title: 'Accept Modal Title',
        open: true,
        message: 'Some message',
        declineBtnLabel: 'Decline message',
        acceptBtnLabel: 'Accept message',
    },
};
