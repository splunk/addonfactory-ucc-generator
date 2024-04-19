import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
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
