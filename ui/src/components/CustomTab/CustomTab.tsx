import React, { useContext, useEffect, useRef, useState } from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import { getBuildDirPath } from '../../util/script';
import { CustomTabConstructor } from './CustomTabBase';
import { Tab } from './CustomTab.types';
import CustomComponentContext from '../../context/CustomComponentContext';

interface CustomTabProps {
    tab: Tab;
}

const CustomTab: React.FC<CustomTabProps> = ({ tab }) => {
    const customCompontentContext = useContext(CustomComponentContext);

    const [loading, setLoading] = useState(true);
    const divRef = useRef<HTMLDivElement>(null);

    const loadCustomTab = (): Promise<CustomTabConstructor> =>
        new Promise((resolve) => {
            const customComp = tab?.customTab?.src
                ? customCompontentContext?.[tab?.customTab?.src]
                : undefined;

            if (customComp?.type === 'tab') {
                const Control = customComp.component;
                resolve(Control);
            } else if (tab.customTab?.type === 'external') {
                import(
                    /* @vite-ignore */ `${getBuildDirPath()}/custom/${tab.customTab.src}.js`
                ).then((external) => {
                    const Control = external.default;
                    resolve(Control);
                });
            }
        });

    useEffect(() => {
        loadCustomTab().then((Control) => {
            if (divRef.current) {
                const customControl = new Control(tab, divRef.current);
                customControl.render();
                setLoading(false);
            }
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {loading && _('Loading...')}
            <div ref={divRef} style={{ visibility: loading ? 'hidden' : 'visible' }} />
        </>
    );
};

export default CustomTab;
