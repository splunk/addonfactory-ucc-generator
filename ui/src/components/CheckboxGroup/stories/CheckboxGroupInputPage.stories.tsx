import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { within, userEvent, expect } from '@storybook/test';
import BaseFormView from '../../BaseFormView/BaseFormView';
import { setUnifiedConfig } from '../../../util/util';
import { serverHandlers } from '../mocks/checkboxGroupMocks';
import checkboxGroupConfig from '../mocks/checkboxGroupMocks.json';
import checkboxGroupRequiredConfig from '../mocks/checkboxGroupRequiredMocks.json';
import InputPage from '../../../pages/Input/InputPage';

const meta = {
    component: InputPage,
    title: 'CheckboxGroup/Page',
    render: (_args, { parameters }) => {
        setUnifiedConfig(parameters.globalConfig);
        return <InputPage />;
    },
    parameters: {
        msw: {
            handlers: serverHandlers,
        },
        globalConfig: checkboxGroupConfig,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const newInputBtn = canvas.getByRole('button', { name: 'Create New Input' });
        await userEvent.click(newInputBtn);

        const root = within(canvasElement.ownerDocument.body);
        await expect(await root.findByRole('dialog')).toBeVisible();
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof BaseFormView>;

export const InputPageView: Story = {};

export const RequiredView: Story = {
    parameters: {
        globalConfig: checkboxGroupRequiredConfig,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const newInputBtn = canvas.getByRole('button', { name: 'Create New Input' });
        await userEvent.click(newInputBtn);

        const root = within(canvasElement.ownerDocument.body);
        await expect(await root.findByRole('dialog')).toBeVisible();

        await userEvent.click(await root.findByText('Add'));
    },
};
