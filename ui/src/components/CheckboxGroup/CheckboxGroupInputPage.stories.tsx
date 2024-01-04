import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { within, userEvent } from '@storybook/testing-library';
import BaseFormView from '../BaseFormView';
import { setUnifiedConfig } from '../../util/util';
import { serverHandlers } from './checkboxGroupMocks';
import checkboxGroupConfig from './checkboxGroupMocks.json';
import InputPage from '../../pages/Input/InputPage';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';

const meta = {
    component: InputPage,
    title: 'InputPage/CheckboxGroup',
    render: (args) => {
        setUnifiedConfig(args?.globalConfig);
        return <InputPage />;
    },
    args: {
        globalConfig: checkboxGroupConfig as GlobalConfig,
    },
    parameters: {
        msw: {
            handlers: serverHandlers,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const newInputBtn = canvas.getByRole('button', { name: 'Create New Input' });
        await userEvent.click(newInputBtn);
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof BaseFormView>;

export const InputPageView: Story = {};
