import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Group from '../Group';

const meta = {
    component: Group,
    title: 'Group',
} satisfies Meta<typeof Group>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        title: <div>title</div>,
        description: 'description',
        children: (
            <div>
                <h3>some data</h3>
                <div>data</div>
                <div>data</div>
            </div>
        ),
        isExpandable: false,
        defaultOpen: true,
    },
};

export const Expandable: Story = {
    args: {
        title: <div>title</div>,
        description: 'description',
        children: (
            <div>
                <h3>some data</h3>
                <div>data</div>
                <div>data</div>
            </div>
        ),
        isExpandable: true,
        defaultOpen: true,
    },
};
