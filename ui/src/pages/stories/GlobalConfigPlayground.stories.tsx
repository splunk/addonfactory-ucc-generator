import type { Meta, StoryObj } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { http, HttpResponse } from 'msw';
import globalConfig from './globalConfig.json';
import ConfigurationPage from '../Configuration/ConfigurationPage';
import { mockServerResponse, mockServerResponseWithContent } from '../../mocks/server-response';
import { setUnifiedConfig } from '../../util/util';
import TabBar from '@splunk/react-ui/TabBar';
import InputPage from '../Input/InputPage';
import { SplunkThemeProvider } from '@splunk/themes';

const meta = {
    title: 'GlobalConfigPlayground',
    render: (args) => {
        const pageMap: Record<string, React.JSX.Element> = {
            configuration: <ConfigurationPage />,
            inputs: <InputPage />,
        };

        const config = JSON.parse(JSON.stringify(args.globalConfig));

        setUnifiedConfig(config);
        const pageKeys = Object.keys(config.pages);
        console.log('pageKeys', pageKeys);
        const [activeTabId, setActiveTabId] = useState(pageKeys[0]);

        const handleChange = useCallback((e, { selectedTabId }) => {
            setActiveTabId(selectedTabId);
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

export const GlobalConfigPlayground: Story = {};
