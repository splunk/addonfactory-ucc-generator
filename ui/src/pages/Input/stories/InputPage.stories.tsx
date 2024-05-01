import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from '@storybook/test';
import { setUnifiedConfig } from '../../../util/util';
import globalConfig from './globalConfig.json';
import InputPage from '../InputPage';
import { mockServerResponseForInput } from '../../../mocks/server-response';

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
                http.get('/servicesNS/nobody/-/:name', () =>
                    HttpResponse.json(mockServerResponseForInput)
                ),
                http.post('/servicesNS/nobody/-/:name', () =>
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
export const InputTabView: Story = {
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
