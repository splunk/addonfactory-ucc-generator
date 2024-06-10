import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import DashboardPage from '../DashboardPage';

import { DASHBOARD_JSON_MOCKS } from '../tests/mockJs';

const meta = {
    component: DashboardPage,
    title: 'DashboardPage',
    render: () => <DashboardPage />,
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

export const DashboardPageView: Story = {};
