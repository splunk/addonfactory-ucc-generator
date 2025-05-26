import { fn } from '@storybook/test';
import { GlobalConfig, Mode } from '../publicApi';
import { StandardPages } from '../types/components/shareableTypes';
import { Platforms } from '../types/globalConfig/pages';

const config = {
    pages: {
        configuration: {
            tabs: [
                {
                    name: 'account',
                    table: {
                        actions: ['edit', 'delete', 'clone'],
                        header: [
                            {
                                label: 'Name',
                                field: 'name',
                            },
                            {
                                label: 'Auth Type',
                                field: 'auth_type',
                            },
                        ],
                    },
                    entity: [],
                    title: 'Account',
                    restHandlerModule: 'splunk_ta_uccexample_validate_account_rh',
                    restHandlerClass: 'CustomAccountValidator',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'example_input_one',
                    entity: [],
                    title: 'Example Input One',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'search', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                ],
                moreInfo: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                ],
            },
        },
    },
    meta: {
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.63.0+c756d7c1f',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.9',
    },
} satisfies GlobalConfig;

type globalConfigInfo = {
    currentServiceState: Record<string, unknown>;
    serviceName: string;
    mode: Mode;
    page: StandardPages;
    stanzaName: string;
    handleFormSubmit: () => void;
    config: GlobalConfig;
    platform: Platforms;
};
export const generateGlobalConfig = (): globalConfigInfo => {
    const baseConfig = {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create',
        page: 'configuration',
        stanzaName: 'unknown',
        handleFormSubmit: fn(),
        config,
        platform: 'enterprise',
    } satisfies globalConfigInfo;
    return baseConfig;
};
