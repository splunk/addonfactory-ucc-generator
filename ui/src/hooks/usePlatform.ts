import { useEffect, useState } from 'react';
import SearchJob from '@splunk/search-job';

import { Platforms } from '../types/globalConfig/pages';
import { GlobalConfig } from '../types/globalConfig/globalConfig';
import { StandardPages } from '../types/components/shareableTypes';
import { AnyEntity } from '../types/components/BaseFormTypes';

const checkIfHideInAnyEntity = (entities: AnyEntity[]): boolean => {
    const isUsed = entities.find((entity) => {
        if ('hideForPlatform' in entity && entity?.options?.hideForPlatform) {
            return true;
        }
        return false;
    });
    return !!isUsed || false;
};

const checkIfHideForPlatformUsed = (globalConfig: GlobalConfig, page?: StandardPages): boolean => {
    if (!page || page === 'configuration') {
        const isHideUsedInConfig = globalConfig.pages.configuration?.tabs.find(
            (tab) => tab.hideForPlatform || checkIfHideInAnyEntity(tab.entity || []) || false
        );
        if (isHideUsedInConfig) {
            return true;
        }
    }

    if (!page || page === 'inputs') {
        const isHideUsedInService = globalConfig.pages.inputs?.services.find(
            (service) =>
                service.hideForPlatform || checkIfHideInAnyEntity(service.entity || []) || false
        );
        if (isHideUsedInService) {
            return true;
        }
    }

    return false;
};

export const usePlatform = (globalConfig: GlobalConfig, page?: StandardPages) => {
    const [platform, setPlatform] = useState<Platforms>();

    useEffect(() => {
        if (!checkIfHideForPlatformUsed(globalConfig, page)) {
            return () => {};
        }

        // search call to get server info, cloud or enterprise
        const mySearchJob = SearchJob.create(
            {
                search: `| rest/services/server/info  splunk_server=local`,
                earliest_time: '-15m', // time does not matter
                latest_time: 'now',
            },
            { cache: true, cancelOnUnload: true } // default cache 10min = 600 in seconds
        );

        const resultsSubscription = mySearchJob
            .getResults()
            .subscribe((result: { results?: Array<{ instance_type?: string }> }) => {
                if (result.results?.[0]?.instance_type === 'cloud') {
                    setPlatform('cloud');
                } else {
                    setPlatform('enterprise');
                }
            });

        return () => {
            resultsSubscription.unsubscribe();
        };
    }, [globalConfig, page]);

    return platform;
};
