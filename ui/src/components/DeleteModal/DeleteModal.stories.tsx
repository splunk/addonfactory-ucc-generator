import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import DeleteModal from './DeleteModal';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';

const meta = {
    component: DeleteModal,
    title: 'Components/DeleteModal',
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
        serviceName: 'serviceName',
        stanzaName: 'stanzaName',
        page: '',
        open: true,
    },
};

export const Inputs: Story = {
    args: {
        serviceName: 'demo_input',
        stanzaName: 'stanzaName',
        page: 'inputs',
        open: true,
    },
};
