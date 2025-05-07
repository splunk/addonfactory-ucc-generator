import type { Meta, StoryObj } from '@storybook/react';
import { SplunkThemeProvider } from '@splunk/themes';
import TabBar, { TabBarChangeHandler } from '@splunk/react-ui/TabBar';
import React, { useCallback, useState } from 'react';
import { http, HttpResponse } from 'msw';

import { mockServerResponse, mockServerResponseWithContent } from '../../mocks/server-response';
import ConfigurationPage from '../Configuration/ConfigurationPage';
import InputPage from '../Input/InputPage';
import { setUnifiedConfig } from '../../util/util';

import globalConfig from './globalConfig/globalConfig.json';
import schema from '../../../../splunk_add_on_ucc_framework/schema/schema.json';
import simpleExampleSchema from './globalConfig/exampleOfGlobalConfig.json';

const meta = {
    title: 'GlobalConfigPlayground',
    render: (configJson) => {
        const pageMap: Record<string, React.JSX.Element> = {
            configuration: <ConfigurationPage />,
            inputs: <InputPage />,
        };

        const config = JSON.parse(JSON.stringify(configJson));

        setUnifiedConfig(config);
        const pageKeys = Object.keys(config.pages);
        const [activeTabId, setActiveTabId] = useState(pageKeys[0]);

        const handleChange: TabBarChangeHandler = useCallback((e, { selectedTabId }) => {
            if (selectedTabId !== undefined) {
                setActiveTabId(selectedTabId);
            }
        }, []);

        const page = pageMap[activeTabId];

        return (
            <>
                <SplunkThemeProvider colorScheme="dark">
                    <TabBar
                        activeTabId={activeTabId}
                        onChange={handleChange}
                        style={{
                            margin: '20px 0',
                            fontSize: '14px',
                            fontFamily:
                                'Spunk Platform Sans, Proxima Nova, Roboto, Droid, Helvetica Neue, Helvetica, Arial, sans-serif',
                            backgroundColor: '#3C444D',
                            height: '44px',
                        }}
                    >
                        {pageKeys.map((pageId) => (
                            <TabBar.Tab
                                label={
                                    config.pages[pageId]?.title ||
                                    `${pageId.charAt(0).toUpperCase()}${pageId.slice(1)}`
                                }
                                tabId={pageId}
                                key={pageId}
                            />
                        ))}
                    </TabBar>
                </SplunkThemeProvider>

                <div style={{ margin: '20px' }}>{page || <div>View not supported</div>}</div>
            </>
        );
    },
    args: globalConfig,
    parameters: {
        msw: {
            handlers: [
                http.get('/servicesNS/nobody/-/:name', () => HttpResponse.json(mockServerResponse)),
                http.get('/servicesNS/nobody/-/:name/:tabName', () =>
                    HttpResponse.json(mockServerResponseWithContent)
                ),
                http.delete('/servicesNS/nobody/-/:ta_name_with_service_name/:stanza_name', () =>
                    HttpResponse.json(mockServerResponse)
                ),
                http.post('/servicesNS/nobody/-/:name', async ({ request }) => {
                    const formData = await request.formData();
                    const name = formData.get('name');
                    const content: Record<string, FormDataEntryValue> = {};
                    formData.forEach((value, key) => {
                        content[key] = value;
                    });
                    delete content.name;

                    return HttpResponse.json(
                        {
                            entry: [
                                {
                                    name,
                                    content,
                                },
                            ],
                        },
                        { status: 201 }
                    );
                }),
                http.post('/servicesNS/nobody/-/:name/:tabName', () =>
                    HttpResponse.json(mockServerResponseWithContent)
                ),
            ],
        },
        snapshots: {
            width: 1200,
            height: 1200,
        },
        jsonschema: {
            schema: { ...schema, examples: [simpleExampleSchema] },
        },
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GlobalConfigPlayground: Story = {};
