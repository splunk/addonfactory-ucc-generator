import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { within, userEvent, expect } from '@storybook/test';
import BaseFormView from '../../BaseFormView';
import { setUnifiedConfig } from '../../../util/util';
import { serverHandlers } from '../checkboxGroupMocks';
import checkboxGroupConfig from '../checkboxGroupMocks.json';
import checkboxGroupRequiredConfig from '../checkboxGroupRequiredMocks.json';
import InputPage from '../../../pages/Input/InputPage';

const meta = {
    component: InputPage,
    title: 'CheckboxGroup/Page',
    render: (args) => {
        setUnifiedConfig(args.globalConfig);
        return <InputPage />;
    },
    args: {
        globalConfig: checkboxGroupConfig,
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

        const root = within(canvasElement.ownerDocument.body);
        await expect(await root.findByRole('dialog')).toBeVisible();
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof BaseFormView>;

export const InputPageView: Story = {};

export const RequiredView: Story = {

    args : {
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
