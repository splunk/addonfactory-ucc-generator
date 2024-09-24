import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { fn } from '@storybook/test';
import DeleteModal from '../DeleteModal';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';

const meta = {
    component: DeleteModal,
    title: 'DeleteModal',
    render: (props) => {
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        setUnifiedConfig(getGlobalConfigMock());
        return <DeleteModal {...props} />;
    },
} satisfies Meta<typeof DeleteModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleRequestClose: fn(),
        serviceName: 'serviceName',
        stanzaName: 'stanzaName',
        page: 'configuration',
        open: true,
    },
};

export const Inputs: Story = {
    args: {
        handleRequestClose: fn(),
        serviceName: 'demo_input',
        stanzaName: 'stanzaName',
        page: 'inputs',
        open: true,
    },
};
