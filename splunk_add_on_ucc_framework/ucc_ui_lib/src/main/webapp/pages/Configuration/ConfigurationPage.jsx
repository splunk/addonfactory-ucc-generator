import React from 'react';

import { _ } from '@splunk/ui-utils/i18n';
import TabLayout from '@splunk/react-ui/TabLayout';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from '../Input/InputPageStyle';
import SingleFormView from '../../components/SingleFormView';
import ConfigurationTable from '../../components/ConfigurationTable';

function ConfigurationPage() {
    const unifiedConfigs = getUnifiedConfigs();
    const { title, description, tabs } = unifiedConfigs.pages.configuration;

    const tabsContent = [];
    tabs.forEach((tab) => {
        if (tab.table) {
            tabsContent.push(
                <TabLayout.Panel key={tab.name} label={tab.title} panelId={tab.name}>
                    <ConfigurationTable
                        serviceName={tab.name}
                        serviceTitle={tab.title}
                        handleSavedata={null}
                    />
                </TabLayout.Panel>
            );
        } else {
            tabsContent.push(
                <TabLayout.Panel key={tab.name} label={tab.title} panelId={tab.name}>
                    <SingleFormView
                        serviceName={tab.name}
                        serviceTitle={tab.title}
                        handleSavedata={null}
                    />
                </TabLayout.Panel>
            );
        }
    });
    return (
        <>
            <TitleComponent>{_(title)}</TitleComponent>
            <SubTitleComponent>{_(description)}</SubTitleComponent>
            <TabLayout defaultActivePanelId={tabs[0].name}>{tabsContent}</TabLayout>
        </>
    );
}

export default ConfigurationPage;
