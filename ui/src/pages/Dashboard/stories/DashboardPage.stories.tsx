import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { within } from '@storybook/test';
import DashboardPage from '../DashboardPage';

import { DASHBOARD_JSON_MOCKS } from '../tests/mockJs';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';

const meta = {
    component: DashboardPage,
    title: 'DashboardPage',
    render: () => {
        const mockConfig = getGlobalConfigMock();
        setUnifiedConfig(mockConfig);
        return <DashboardPage />;
    },
    parameters: {
        msw: {
            handlers: DASHBOARD_JSON_MOCKS,
        },
        snapshots: {
            width: 1200,
            height: 1200,
        },
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardPageView: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await canvas.findByRole('heading', { name: 'Data Ingestion' });
        await canvas.findAllByText((match) => match.includes('Search sid not found'), undefined, {
            timeout: 10_000,
        });
    },
};
