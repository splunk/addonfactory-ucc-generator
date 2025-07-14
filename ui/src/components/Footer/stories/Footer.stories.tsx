import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Footer from '../Footer';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';

// Storybook metadata
const meta = {
    component: Footer,
    title: 'Footer',
    render: () => {
        setUnifiedConfig(getGlobalConfigMock());
        return (
            <div
                style={{
                    marginTop: 'calc( 100vh - 78px - 70px)',
                }}
            >
                <Footer />
            </div>
        );
    },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base Footer story
export const Base: Story = {
    args: {},
};
