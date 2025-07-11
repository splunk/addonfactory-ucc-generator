import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { waitFor, within, expect } from '@storybook/test';
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

        await waitFor(
            () => {
                expect(canvas.queryByTestId('wait-spinner')).toBeNull();
            },
            { timeout: 5000 } // Wait for the loading spinner to disappear
        );

        await canvas.findByRole('heading', { name: 'Data Ingestion' }, { timeout: 5000 });
        await canvas.findAllByText((match) => match.includes('Search sid not found'), undefined, {
            timeout: 5000,
        });
    },
};
