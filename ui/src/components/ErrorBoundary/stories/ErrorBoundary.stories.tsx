import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';

const ErrorGenerator = () => {
    throw new Error('Some internal error message. It should not be shown to the user');
};

const meta = {
    component: ErrorBoundary,
    title: 'ErrorBoundary',
    render: () => {
        setUnifiedConfig(getGlobalConfigMock());

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
        children: <span />,
    },
};
