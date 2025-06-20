import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import SearchJob from '@splunk/search-job';
import { variables } from '@splunk/themes';
import { getUnifiedConfigs } from '../util/util';
import { parseErrorMsg } from '../util/messageUtil';
import { SearchResponse } from './Dashboard/DataIngestion.types';

const FooterWrapper = styled.footer`
    padding: ${variables.spacingXSmall} ${variables.fontSizeXXLarge};
    padding-bottom: 0px;
    display: flex;
    font-size: ${variables.fontSizeSmall};
    border-top: 1px solid ${variables.borderActiveColor};
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    align-items: end;
    justify-content: flex-end;
    flex-direction: column;
`;

const VersionInfo = styled.div`
    font-weight: 500;
`;

const runSearchJob = (searchQuery: string): Promise<SearchResponse> =>
    new Promise((resolve, reject) => {
        const searchJob = SearchJob.create({ search: searchQuery });

        const resultsSubscription = searchJob.getResults({ count: 0 }).subscribe({
            next: (response: SearchResponse) => resolve(response),
            error: (error: unknown) => reject(error),
            complete: () => resultsSubscription.unsubscribe(),
        });
    });

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
                    const utcString = new Date(parseInt(buildValue, 10) * 1000).toUTCString();
                    setBuild(utcString);
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
            <VersionInfo>Addon Version: {meta.version || 'Unknown'}</VersionInfo>
            <div>{error ? `Build Error: ${error}` : `Build Time: ${build}`}</div>
        </FooterWrapper>
    );
};

export default Footer;
