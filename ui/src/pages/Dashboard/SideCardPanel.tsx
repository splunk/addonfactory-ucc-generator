import Button from '@splunk/react-ui/Button';
import Card from '@splunk/react-ui/Card';
import TabLayout from '@splunk/react-ui/TabLayout';
import React, { useEffect } from 'react';
import { CustomDashboard } from './Custom';

interface ISideCardPanelProps {
    setDisplaySideMenuForInput: (x: string | null) => void;
    spikeDef: Record<string, unknown> | null;
    display?: boolean;
    displaySideMenuForInput: string | null;
}

export const SideCardPanel = ({
    setDisplaySideMenuForInput,
    spikeDef,
    display,
    displaySideMenuForInput,
}: ISideCardPanelProps) => {
    useEffect(() => {
        if (!display) {
            return () => {};
        }
        const table = document.querySelector('#data_ingestion_table_viz') as HTMLElement;
        if (table?.style) {
            table.style.gridColumn = '1 / 7';
        }

        return () => {
            if (table?.style) {
                table.style.gridColumn = '';
            }
        };
    }, [display]);

    return (
        <Card id="spikeCardSidePanel" style={{ display: display ? '' : 'none' }}>
            <Card.Header
                title={`Title for - ${displaySideMenuForInput}`}
                subtitle="subtitlesubtitlesubtitle"
                actionPrimary={
                    <Button label="X" onClick={() => setDisplaySideMenuForInput(null)} />
                }
            />
            <Card.Body>
                <div id="SpikeSidePanel">
                    <TabLayout.Panel label="spike" panelId="spikeDefTabPanel">
                        <CustomDashboard dashboardDefinition={spikeDef} />
                    </TabLayout.Panel>
                </div>
            </Card.Body>
            <Card.Footer>
                <Button appearance="secondary" onClick={() => setDisplaySideMenuForInput(null)}>
                    Close
                </Button>
            </Card.Footer>
        </Card>
    );
};
