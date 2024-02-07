import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import EntityModal from '../EntityModal';
import { setUnifiedConfig } from '../../../util/util';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';

const meta = {
    component: EntityModal,
    title: 'EntityModal',
    render: (props) => {
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        setUnifiedConfig(getGlobalConfigMock()); // eslint-disable-line no-use-before-define

        return <EntityModal {...props} />;
    },
    parameters: {
        a11y: {
            element: '[data-test="modal"]',
        },
    },
} satisfies Meta<typeof EntityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        serviceName: 'account',
        mode: 'create',
        stanzaName: undefined,
        formLabel: '',
        page: 'configuration',
        groupName: '',
        open: true,
    },
};

export const Inputs: Story = {
    args: {
        serviceName: 'demo_input',
        mode: 'create',
        stanzaName: undefined,
        formLabel: '',
        page: 'inputs',
        groupName: '',
        open: true,
    },
};
