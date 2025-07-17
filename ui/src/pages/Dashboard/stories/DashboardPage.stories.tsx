import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { waitForElementToBeRemoved, within } from '@storybook/test';
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

        // Wait for spinner to disappear
        await waitForElementToBeRemoved(() => canvas.getByTestId('wait-spinner'), {
            timeout: 10000,
        });

        // Check for the correct tab
        await canvas.findByRole('tab', { name: /Data ingestion/i }, { timeout: 5000 });
        await canvas.findAllByText(/Search sid not found/i, {}, { timeout: 5000 });
    },
};
