import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { userEvent, within, expect } from '@storybook/test';
import { setUnifiedConfig } from '../../../util/util';
import globalConfig from './globalConfig.json';
import ConfigurationPage from '../ConfigurationPage';
import { mockServerResponse, mockServerResponseWithContent } from '../../../mocks/server-response';

const meta = {
    component: ConfigurationPage,
    title: 'ConfigurationPage',
    render: (args) => {
        setUnifiedConfig(JSON.parse(JSON.stringify(args.globalConfig)));
        return <ConfigurationPage />;
    },
    args: {
        globalConfig,
    },
    parameters: {
        msw: {
            handlers: [
                http.get('/servicesNS/nobody/-/:name', () => HttpResponse.json(mockServerResponse)),
                http.get('/servicesNS/nobody/-/:name/:tabName', () =>
                    HttpResponse.json(mockServerResponseWithContent)
                ),
                http.post('/servicesNS/nobody/-/:name', () =>
                    HttpResponse.json(mockServerResponse)
                ),
                http.post('/servicesNS/nobody/-/:name/:tabName', () =>
                    HttpResponse.json(mockServerResponseWithContent)
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

export const ConfigurationPageView: Story = {};

export const ConfigurationViewAdd: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await userEvent.click(closeBtn);
        }
        const addButton = await canvas.findByRole('button', { name: 'Add' });
        await userEvent.click(addButton);
    },
};

export const ConfigurationCustomHeader: Story = {
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const canvas = within(canvasElement);
        const closeBtn = canvas.queryByRole('button', { name: /(Close)|(Cancel)/ });
        if (closeBtn) {
            await userEvent.click(closeBtn);
        }
        const findTab = await canvas.findByRole('tab', { name: 'Custom header tab' });
        await userEvent.click(findTab);

        const addButton = await canvas.findByRole('button', { name: 'Add' });
        await userEvent.click(addButton);
        await expect(
            await body.findByRole('dialog', { name: 'Add custom header' })
        ).toBeInTheDocument();
    },
};

export const MultiTabsStory: Story = {
    args: {
        globalConfig: {
            ...globalConfig,
            pages: {
                configuration: {
                    ...globalConfig.pages.configuration,
                    tabs: Array.from({ length: 12 }, (_, i) => ({
                        name: `tab${i + 1}`,
                        title: `this is tab ${i + 1}`,
                        entity: [
                            {
                                type: 'text',
                                label: `Name ${i + 1}`,
                                field: 'name',
                                help: 'Enter a unique name for this account.',
                                required: true,
                            },
                        ],
                    })),
                },
            },
        },
    },
    parameters: {
        snapshots: {
            width: 1000,
            height: 600,
        },
    },
};

export const LongTabNameStory: Story = {
    args: {
        globalConfig: {
            ...globalConfig,
            pages: {
                configuration: {
                    ...globalConfig.pages.configuration,
                    tabs: [
                        {
                            name: `tab1`,
                            title: `This is tab with long name`,
                            entity: [
                                {
                                    type: 'text',
                                    label: `Name 1`,
                                    field: 'name',
                                    help: 'Enter a unique name for this account.',
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: `tab2`,
                            title: `Lorem Ipsum is simply dummy text of the printing and type setting industry`,
                            entity: [
                                {
                                    type: 'text',
                                    label: `Name 2`,
                                    field: 'name',
                                    help: 'Enter a unique name for this account.',
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: `tab3`,
                            title: `Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book`,
                            entity: [
                                {
                                    type: 'text',
                                    label: `Name 3`,
                                    field: 'name',
                                    help: 'Enter a unique name for this account.',
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    },
    parameters: {
        snapshots: {
            width: 1000,
            height: 600,
        },
    },
};
