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
                                        name: 'my disabled input',
                                        content: {
                                            disabled: '1',
                                            hard_disabled: 'f',
                                            hide_in_ui: 'N',
                                        },
                                    },
                                    {
                                        name: 'my read only input',
                                        content: {
                                            hard_disabled: '1',
                                        },
                                    },
                                    {
                                        name: 'my hidden input',
                                        content: {
                                            hide_in_ui: 'y',
                                        },
                                    },
                                ])
                            );
                        case 'demo_addon_for_splunk_demo_input_page':
                            return HttpResponse.json(mockServerResponseForInput);
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

        // there are 4 inputs where 1 is hidden
        // the header counts as a row
        await expect(await canvas.findAllByRole('row')).toHaveLength(4);
    },
};
export const InputPageExpandedRow: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click((await canvas.findAllByRole('cell', { name: /expandable row/i }))[0]);
    },
};
export const InputPageViewAdd: Story = {
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);

        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await userEvent.click(closeBtn);
        }

        await userEvent.click(canvas.getByRole('button', { name: 'Create New Input' }));

        await userEvent.click(await body.findByText('demo_input'));
    },
};
export const InputTabViewAdd: Story = {
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);
        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await userEvent.click(closeBtn);
        }
        await userEvent.click(canvas.getByRole('button', { name: 'Create New Input' }));

        await userEvent.click(await body.findByText('Demo input page'));
    },
};
