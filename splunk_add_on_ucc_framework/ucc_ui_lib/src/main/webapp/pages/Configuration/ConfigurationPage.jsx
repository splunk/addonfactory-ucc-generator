import React, { useState, useCallback } from 'react';

import { _ } from '@splunk/ui-utils/i18n';
import TabBar from '@splunk/react-ui/TabBar';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

import { getUnifiedConfigs } from '../../util/util';
import ErrorBoundary from '../../components/ErrorBoundary';
import { TitleComponent, SubTitleComponent } from '../Input/InputPageStyle';
import ConfigurationFormView from '../../components/ConfigurationFormView';
import ConfigurationTable from '../../components/ConfigurationTable';

function ConfigurationPage() {
    const unifiedConfigs = getUnifiedConfigs();
    const { title, description, tabs } = unifiedConfigs.pages.configuration;

    const [activeTabId, setActiveTabId] = useState(tabs[0].name);

    const handleChange = useCallback((e, { selectedTabId }) => {
        setActiveTabId(selectedTabId);
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
                        style={
                            tab.name !== activeTabId ? { display: 'none' } : { display: 'block' }
                        }
                    >
                        <ConfigurationTable serviceName={tab.name} serviceTitle={tab.title} />
                    </div>
                ) : (
                    <div
                        style={
                            tab.name !== activeTabId ? { display: 'none' } : { display: 'block' }
                        }
                    >
                        <ConfigurationFormView serviceName={tab.name} />
                    </div>
                );
            })}
        </ErrorBoundary>
    );
}

export default ConfigurationPage;
