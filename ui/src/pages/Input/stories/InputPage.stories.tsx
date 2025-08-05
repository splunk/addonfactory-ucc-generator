import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { userEvent, within, expect } from '@storybook/test';
import { setUnifiedConfig } from '../../../util/util';
import globalConfig from './globalConfig.json';
import InputPage from '../InputPage';
import {
    getMockServerResponseForInput,
    mockServerResponseForInput,
} from '../../../mocks/server-response';

const meta = {
    component: InputPage,
    title: 'InputPage',
    render: (args) => {
        setUnifiedConfig(JSON.parse(JSON.stringify(args.globalConfig)));
        return <InputPage />;
    },
    args: {
        globalConfig,
    },
    parameters: {
        msw: {
            handlers: [
                http.get('/servicesNS/nobody/-/:inputName', ({ params }) => {
                    switch (params.inputName) {
                        case 'demo_addon_for_splunk_demo_input':
                            return HttpResponse.json(
                                getMockServerResponseForInput([
                                    {
                                        name: 'my_disabled_input',
                                        content: {
                                            disabled: '1',
                                            hard_disabled: 'f',
                                            hide_in_ui: 'N',
                                            account: 'value1',
                                        },
                                    },
                                    {
                                        name: 'my_read_only_input',
                                        content: {
                                            hard_disabled: '1',
                                        },
                                    },
                                    {
                                        name: 'my_hidden_input',
                                        content: {
                                            hide_in_ui: 'y',
                                        },
                                    },
                                ])
                            );
                        case 'demo_addon_for_splunk_demo_input_page':
                            return HttpResponse.json(mockServerResponseForInput);
                        case 'demo_addon_for_splunk_demo_input_custom':
                            return HttpResponse.json(
                                getMockServerResponseForInput([
                                    {
                                        name: 'name_demo_custom',
                                        content: {
                                            account: 'value1',
                                        },
                                    },
                                ])
                            );
                        default:
                            return HttpResponse.error();
                    }
                }),
                http.post('/servicesNS/nobody/-/:inputName/:name', () =>
                    HttpResponse.json(mockServerResponseForInput)
                ),
            ],
        },
        snapshots: {
            width: 1200,
            height: 1200,
        },
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputPageView: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // there are 5 inputs where 1 is hidden
        // the header counts as a row
        await expect(await canvas.findAllByRole('row')).toHaveLength(5);
    },
};
export const InputPageExpandedRow: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const expandableCell = (await canvas.findAllByRole('cell')).filter(
            (cell) => cell.dataset.test === 'expand'
        )[0];
        const expandable = within(expandableCell).getByRole('button');

        await userEvent.click(expandable);
        await expect((await canvas.findAllByRole('definition')).length).toBeGreaterThan(0);
    },
};
export const InputPageViewAdd: Story = {
    play: async ({ canvasElement }) => {
        const user = userEvent.setup();
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);

        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await user.click(closeBtn);
        }

        await user.click(canvas.getByRole('button', { name: 'Create New Input' }));

        await user.click(await body.findByText('demo_input'));
        await expect(
            await body.findByRole('dialog', { name: 'Add demo_input' })
        ).toBeInTheDocument();
    },
};

export const InputPageViewUpdateInput: Story = {
    play: async ({ canvasElement }) => {
        const user = userEvent.setup();
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);

        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await user.click(closeBtn);
        }

        const editButtons = await canvas.findAllByRole('button', { name: 'Edit' });
        await user.click(editButtons[0]);

        await expect(
            await body.findByRole('dialog', { name: 'Update demo_input' })
        ).toBeInTheDocument();
    },
};

export const InputTabCustomHeader: Story = {
    play: async ({ canvasElement }) => {
        const user = userEvent.setup();
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);

        // Look for Close/Cancel button from the previous dialog
        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });

        if (closeBtn) {
            await user.click(closeBtn);
        }

        await canvas.findByRole('button', { name: 'Create New Input' });

        const editButtons = await canvas.findAllByTestId('edit-button');
        await user.click(editButtons[2]);

        await expect(
            await body.findByRole('dialog', { name: 'Update custom header' })
        ).toBeInTheDocument();
    },
};

export const InputTabViewAdd: Story = {
    play: async ({ canvasElement }) => {
        const user = userEvent.setup();
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);
        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await user.click(closeBtn);
        }
        await user.click(canvas.getByRole('button', { name: 'Create New Input' }));

        await user.click(await body.findByText('Demo input page'));
        await expect(await canvas.findByRole('textbox', { name: /name/i })).toBeInTheDocument();
    },
};
