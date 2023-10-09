import type { Meta, StoryObj } from '@storybook/react';
import BaseFormView from '../BaseFormView';
import Date from './Date';

const meta = {
    component: Date,
    title: 'Components/Date',
    args: {
        field: 'dateField',
        value: '2023-10-04',
    },
} satisfies Meta<typeof BaseFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Error: Story = {
    args: {
        error: true,
    },
};
