import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { _ } from '@splunk/ui-utils/i18n';
import TabBar from '@splunk/react-ui/TabBar';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

import useQuery from '../../hooks/useQuery';
import { getUnifiedConfigs } from '../../util/util';
import ErrorBoundary from '../../components/ErrorBoundary';
import { TitleComponent, SubTitleComponent } from '../Input/InputPageStyle';
import ConfigurationFormView from '../../components/ConfigurationFormView';
import ConfigurationTable from '../../components/ConfigurationTable';

function ConfigurationPage() {
    const unifiedConfigs = getUnifiedConfigs();
    const { title, description, tabs } = unifiedConfigs.pages.configuration;
    const permittedTabNames = tabs.map((tab) => {
        return tab.name;
    });

    const [activeTabId, setActiveTabId] = useState(tabs[0].name);

    const history = useHistory();
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
    }, [history.location.search]);

    // Run only once to set initial default tab query param
    useEffect(() => {
        if (!query.get('tab')) {
            query.set('tab', activeTabId);
            history.push({ search: query.toString() });
        }
    }, []);

    const handleChange = useCallback((e, { selectedTabId }) => {
        setActiveTabId(selectedTabId);
        query.set('tab', selectedTabId);
        history.push({ search: query.toString() });
    }, []);

    return (
        <ErrorBoundary>
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row style={{ padding: '5px 0px' }}>
                    <ColumnLayout.Column span={9}>
                        <TitleComponent>{_(title)}</TitleComponent>
                        <SubTitleComponent>{_(description)}</SubTitleComponent>
                    </ColumnLayout.Column>
                </ColumnLayout.Row>
            </ColumnLayout>
            <TabBar activeTabId={activeTabId} onChange={handleChange}>
                {tabs.map((tab) => (
                    <TabBar.Tab key={tab.name} label={_(tab.title)} tabId={tab.name} />
                ))}
            </TabBar>
            {tabs.map((tab) => {
                return tab.table ? (
                    <div
                        key={tab.name}
                        style={
                            tab.name !== activeTabId ? { display: 'none' } : { display: 'block' }
                        }
                    >
                        <ConfigurationTable
                            key={tab.name}
                            serviceName={tab.name}
                            serviceTitle={tab.title}
                        />
                    </div>
                ) : (
                    <div
                        key={tab.name}
                        style={
                            tab.name !== activeTabId ? { display: 'none' } : { display: 'block' }
                        }
                    >
                        <ConfigurationFormView key={tab.name} serviceName={tab.name} />
                    </div>
                );
            })}
        </ErrorBoundary>
    );
}

export default ConfigurationPage;
