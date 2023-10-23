import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';
import { getUnifiedConfigs } from '../util/util';
import { getBuildDirPath } from '../util/script';

function CustomTab({ tab }) {
    const [loading, setLoading] = useState(true);
    const divRef = useRef(null);

    const globalConfig = getUnifiedConfigs();
    const appName = globalConfig.meta.name;

    const loadCustomTab = () =>
        new Promise((resolve) => {
            if (tab.customTab.type === 'external') {
                import(
                    /* webpackIgnore: true */ `${getBuildDirPath()}/custom/${tab.customTab.src}.js`
                ).then((external) => {
                    const Control = external.default;
                    resolve(Control);
                });
            } else {
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${tab.customTab.src}`],
                    (Control) => resolve(Control)
                );
            }
        });

    useEffect(() => {
        loadCustomTab().then((Control) => {
            const customControl = new Control(tab, divRef.current);
            customControl.render();
            setLoading(false);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {loading && _('Loading...')}
            <div ref={divRef} style={{ visibility: loading ? 'hidden' : 'visible' }} />
        </>
    );
}

CustomTab.propTypes = {
    tab: PropTypes.object.isRequired,
};

export default CustomTab;
