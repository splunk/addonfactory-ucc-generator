import React, { useEffect, useRef, useState } from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
import { CustomTabConstructor } from './CustomTabBase';
import { Tab } from './CustomTab.types';

interface CustomTabProps {
    tab: Tab;
}

const CustomTab: React.FC<CustomTabProps> = ({ tab }) => {
    const [loading, setLoading] = useState(true);
    const divRef = useRef<HTMLDivElement>(null);

    const globalConfig = getUnifiedConfigs();
    const appName = globalConfig.meta.name;

    const loadCustomTab = (): Promise<CustomTabConstructor> =>
        new Promise((resolve) => {
            if (tab.customTab?.type === 'external') {
                import(
                    /* webpackIgnore: true */ `${getBuildDirPath()}/custom/${tab.customTab.src}.js`
                ).then((external) => {
                    const Control = external.default;
                    resolve(Control);
                });
            } else {
                // @ts-expect-error should be exported to other js module and imported here
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${tab.customTab?.src}`],
                    (Control: CustomTabConstructor) => resolve(Control)
                );
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
