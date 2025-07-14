import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import { getUnifiedConfigs } from '../../util/util';
import { parseErrorMsg } from '../../util/messageUtil';
import { runSearchJob } from '../../pages/Dashboard/utils';

const FooterWrapper = styled.footer`
    padding: ${variables.spacingXSmall} ${variables.fontSizeXXLarge};
    padding-bottom: 0;
    display: flex;
    font-size: ${variables.fontSizeSmall};
    border-top: 1px solid ${variables.borderActiveColor};
    justify-content: flex-end;
    flex-direction: column;
    align-items: flex-end;
`;

const VersionInfo = styled.div`
    font-weight: ${variables.fontWeightSemiBold};
`;

const Footer = () => {
    const [build, setBuild] = useState('...');
    const [error, setError] = useState<string | null>(null);

    const { meta } = getUnifiedConfigs();
    const shouldShowFooter = meta.showFooter === undefined || meta.showFooter;

    useEffect(() => {
        if (!shouldShowFooter) {
            return;
        }

        const fetchBuildVersion = async () => {
            try {
                const SPL_QUERY = `| rest services/apps/local/${meta.name} splunk_server=local | fields build`;
                const response = await runSearchJob(SPL_QUERY);
                const buildValue = response?.results?.[0]?.build;

                if (buildValue && /^\d+$/.test(buildValue)) {
                    const buildTimestamp = parseInt(buildValue, 10) * 1000;
                    const utcFormatter = new Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                        timeZone: 'UTC',
                        hour12: false,
                    });

                    const formattedUTC = `${utcFormatter.format(new Date(buildTimestamp))} UTC`;
                    setBuild(formattedUTC);
                }
            } catch (err) {
                setError(parseErrorMsg(err));
            }
        };

        fetchBuildVersion();
    }, [meta.name, shouldShowFooter]);

    if (!shouldShowFooter) {
        return null;
    }

    return (
        <FooterWrapper role="contentinfo">
            <VersionInfo>Add-on Version: {meta.version || 'Unknown'}</VersionInfo>
            <div>{error ? `Build Error: ${error}` : `Build Time: ${build}`}</div>
        </FooterWrapper>
    );
};

export default Footer;
