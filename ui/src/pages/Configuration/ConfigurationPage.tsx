import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import TabBar, { TabBarChangeHandler } from '@splunk/react-ui/TabBar';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

import styled from 'styled-components';
import { z } from 'zod';
import useQuery from '../../hooks/useQuery';
import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from '../Input/InputPageStyle';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import CustomTab from '../../components/CustomTab/CustomTab';
import ConfigurationFormView from '../../components/ConfigurationFormView';
import ConfigurationTable from '../../components/ConfigurationTable';
import OpenApiDownloadButton from '../../components/DownloadButton/OpenApiDownloadBtn';
import SubDescription from '../../components/SubDescription/SubDescription';
import UccCredit from '../../components/UCCCredit/UCCCredit';
import { TabSchema } from '../../types/globalConfig/pages';

const StyledHeaderControls = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: end;
    flex-wrap: wrap;
    gap: 0.4rem;
`;

const Row = styled(ColumnLayout.Row)`
    padding: 5px 0px;

    .dropdown {
        text-align: right;
    }

    .input_button {
        text-align: right;
        margin-right: 0px;
    }
`;

type TabSchema = z.infer<typeof TabSchema>;

function ConfigurationPage() {
    const unifiedConfigs = getUnifiedConfigs();
    const { title, description, subDescription, tabs } = unifiedConfigs.pages.configuration;
    const permittedTabNames = useMemo(() => tabs.map((tab) => tab.name), [tabs]);
    const isComponentMounted = useRef(false);

    const [activeTabId, setActiveTabId] = useState(tabs[0].name);
    const [isPageOpen, setIsPageOpen] = useState(false);

    const query = useQuery();
    const queryTabValue = query?.get('tab');

    // Run initially and when query is updated to set active tab based on initial URL
    // or while navigating browser history
    useEffect(() => {
        // Only change active tab when provided tab in query is specified in globalConfig
        // and if the current active tab is not same as provided in query
        if (
            queryTabValue &&
            permittedTabNames.includes(queryTabValue) &&
            queryTabValue !== activeTabId
        ) {
            setActiveTabId(queryTabValue);
        }
    }, [queryTabValue, permittedTabNames, activeTabId]);

    useEffect(() => {
        isComponentMounted.current = true;
        return () => {
            isComponentMounted.current = false;
        };
    }, []);

    const handleChange = useCallback<TabBarChangeHandler>((e, { selectedTabId }) => {
        if (isComponentMounted.current && selectedTabId) {
            setActiveTabId(selectedTabId);
            setIsPageOpen(false);
        }
    }, []);

    const updateIsPageOpen = (data: boolean) => {
        if (isComponentMounted.current) {
            setIsPageOpen(data);
        }
    };

    const getCustomTab = (tab: TabSchema) => React.createElement(CustomTab, { tab });

    const getTabContent = (tab: TabSchema) => {
        let TabComponent;
        if (tab?.customTab) {
            TabComponent = getCustomTab(tab);
        } else {
            TabComponent = tab?.table ? (
                <ConfigurationTable
                    key={tab.name}
                    selectedTab={tab}
                    updateIsPageOpen={updateIsPageOpen}
                />
            ) : (
                <ConfigurationFormView key={tab.name} serviceName={tab.name} />
            );
        }

        return (
            <div
                key={tab.name}
                style={tab.name !== activeTabId ? { display: 'none' } : { display: 'block' }}
                id={`${tab.name}Tab`}
            >
                {TabComponent}
            </div>
        );
    };

    return (
        <ErrorBoundary>
            <>
                <div style={isPageOpen ? { display: 'none' } : { display: 'block' }}>
                    <ColumnLayout gutter={8}>
                        <Row>
                            <ColumnLayout.Column span={9}>
                                <TitleComponent>{_(title)}</TitleComponent>
                                <SubTitleComponent>{_(description || '')}</SubTitleComponent>
                                <SubDescription
                                    text={subDescription?.text || ''}
                                    links={subDescription?.links}
                                />
                            </ColumnLayout.Column>
                            <ColumnLayout.Column span={3} style={{ textAlignLast: 'right' }}>
                                <StyledHeaderControls>
                                    <UccCredit />
                                    <OpenApiDownloadButton />
                                </StyledHeaderControls>
                            </ColumnLayout.Column>
                        </Row>
                    </ColumnLayout>
                    <TabBar activeTabId={activeTabId} onChange={handleChange}>
                        {tabs.map((tab) => (
                            <TabBar.Tab key={tab.name} label={_(tab.title)} tabId={tab.name} />
                        ))}
                    </TabBar>
                </div>
                {tabs.map((tab) => getTabContent(tab))}
                <ToastMessages position="top-right" />
            </>
        </ErrorBoundary>
    );
}

export default ConfigurationPage;
