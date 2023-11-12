import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import EntityPage from './EntityPage';
import { setUnifiedConfig } from '../util/util';
import { getGlobalConfigMock } from '../mocks/globalConfigMock';

const meta = {
    component: EntityPage,
    title: 'Components/EntityPage',
    render: (props) => {
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        setUnifiedConfig(getGlobalConfigMock());
        return <EntityPage {...props} />;
    },
} satisfies Meta<typeof EntityPage>;

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
    },
};
