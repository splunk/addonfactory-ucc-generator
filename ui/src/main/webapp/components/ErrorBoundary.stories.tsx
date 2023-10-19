import type { Meta, StoryObj } from '@storybook/react';
import ErrorBoundary from './ErrorBoundary';
import React, { useState } from 'react';

const ErrorGenerator = () => {
    throw new Error('some error message');
};

const meta = {
    component: ErrorBoundary,
    title: 'Components/ErrorBoundary',
    render: () => {
        return (
            <ErrorBoundary>
                <ErrorGenerator />
            </ErrorBoundary>
        );
    },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        children: <></>,
    },
};
