import React, { useCallback, useEffect, useState } from 'react';

import { _ } from '@splunk/ui-utils/i18n';
import TabBar from '@splunk/react-ui/TabBar';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import styled from 'styled-components';

import useQuery from '../../hooks/useQuery';
import { getUnifiedConfigs } from '../../util/util';
import { SubTitleComponent, TitleComponent } from '../Input/InputPageStyle';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import CustomTab from '../../components/CustomTab/CustomTab';
import ConfigurationFormView from '../../components/ConfigurationFormView';
import ConfigurationTable from '../../components/ConfigurationTable';
import OpenApiDownloadButton from '../../components/DownloadButton/OpenApiDownloadBtn';
import SubDescription from '../../components/SubDescription/SubDescription';
import UccCredit from '../../components/UCCCredit/UCCCredit';

const StyledHeader = styled.header`
    display: flex;
    justify-content: space-between;
`;

const StyledHeaderControls = styled.div`
    align-items: center;
    display: flex;
    gap: 0.4rem;
`;

function ConfigurationPage() {
    const unifiedConfigs = getUnifiedConfigs();
    const { title, description, subDescription, tabs } = unifiedConfigs.pages.configuration;
    const permittedTabNames = tabs.map((tab) => tab.name);

    const [activeTabId, setActiveTabId] = useState(tabs[0].name);
    const [isPageOpen, setIsPageOpen] = useState(false);

    const query = useQuery();

    // Run initially and when query is updated to set active tab based on initial URL
    // or while navigating browser history
    useEffect(() => {
        // Only change active tab when provided tab in query is specified in globalConfig
        // and if the current active tab is not same as provided in query
        if (
            query &&
            permittedTabNames.includes(query.get('tab')) &&
            query.get('tab') !== activeTabId
        ) {
            setActiveTabId(query.get('tab'));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = useCallback(
        (e, { selectedTabId }) => {
            setActiveTabId(selectedTabId);
            setIsPageOpen(false);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeTabId]
    );

    const updateIsPageOpen = (data) => {
        setIsPageOpen(data);
    };

    const getCustomTab = (tab) => React.createElement(CustomTab, { tab });

    const getTabContent = (tab) => {
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
            <div style={isPageOpen ? { display: 'none' } : { display: 'block' }}>
                <StyledHeader>
                    <TitleComponent>{_(title)}</TitleComponent>
                    <StyledHeaderControls>
                        <UccCredit />
                        <OpenApiDownloadButton />
                    </StyledHeaderControls>
                </StyledHeader>
                <SubTitleComponent>{_(description || '')}</SubTitleComponent>
                <SubDescription {...subDescription} />
                <TabBar activeTabId={activeTabId} onChange={handleChange}>
                    {tabs.map((tab) => (
                        <TabBar.Tab key={tab.name} label={_(tab.title)} tabId={tab.name} />
                    ))}
                </TabBar>
            </div>
            {tabs.map((tab) => getTabContent(tab))}
            <ToastMessages position="top-right" />
        </ErrorBoundary>
    );
}

export default ConfigurationPage;
