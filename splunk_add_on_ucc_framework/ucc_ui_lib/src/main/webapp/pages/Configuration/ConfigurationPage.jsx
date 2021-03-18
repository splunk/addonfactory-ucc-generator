import React from 'react';

import { _ } from '@splunk/ui-utils/i18n';
import TabLayout from '@splunk/react-ui/TabLayout';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from '../Input/InputPageStyle';
import ConfigurationFormView from '../../components/ConfigurationFormView';
import ConfigurationTable from '../../components/ConfigurationTable';

function ConfigurationPage() {
    const unifiedConfigs = getUnifiedConfigs();
    const { title, description, tabs } = unifiedConfigs.pages.configuration;

    const tabsContent = [];
    tabs.forEach((tab) => {
        if (tab.table) {
            tabsContent.push(
                <TabLayout.Panel key={tab.name} label={tab.title} panelId={tab.name}>
                    <ConfigurationTable serviceName={tab.name} serviceTitle={tab.title} />
                </TabLayout.Panel>
            );
        } else {
            tabsContent.push(
                <TabLayout.Panel key={tab.name} label={tab.title} panelId={tab.name}>
                    <ConfigurationFormView serviceName={tab.name} />
                </TabLayout.Panel>
            );
        }
    });
    return (
        <>
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row style={{ padding: '5px 0px' }}>
                    <ColumnLayout.Column span={9}>
                        <TitleComponent>{_(title)}</TitleComponent>
                        <SubTitleComponent>{_(description)}</SubTitleComponent>
                    </ColumnLayout.Column>
                </ColumnLayout.Row>
            </ColumnLayout>
            <TabLayout defaultActivePanelId={tabs[0].name}>{tabsContent}</TabLayout>
        </>
    );
}

export default ConfigurationPage;
