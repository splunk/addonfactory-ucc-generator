import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import EntityModal from './EntityModal';
import { setUnifiedConfig } from '../util/util';

const meta = {
    component: EntityModal,
    title: 'Components/EntityModal',
    render: (props) => {
        // for visibility declared at bottom
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        setUnifiedConfig(unifiedConfig); // eslint-disable-line no-use-before-define
        return <EntityModal {...props} />;
    },
} satisfies Meta<typeof EntityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        serviceName: 'account',
        mode: 'create',
        stanzaName: undefined,
        formLabel: '',
        page: 'configuration',
        groupName: '',
        open: true,
    },
};

export const Inputs: Story = {
    args: {
        serviceName: 'demo_input',
        mode: 'create',
        stanzaName: undefined,
        formLabel: '',
        page: 'inputs',
        groupName: '',
        open: true,
    },
};

// this const is used in render method
// declared here to not obfuscate code
const unifiedConfig = {
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
                        ],
                    },
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                                {
                                    type: 'string',
                                    errorMsg: 'Length of input name should be between 1 and 100',
                                    minLength: 1,
                                    maxLength: 100,
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the account.',
                            required: true,
                        },
                        {
                            type: 'file',
                            label: 'Upload File',
                            help: "Upload service account's certificate",
                            field: 'service_account',
                            options: {
                                fileSupportMessage: 'Here is the support message',
                                supportedFileTypes: ['json'],
                            },
                            encrypted: true,
                            required: true,
                        },
                    ],
                    title: 'Accounts',
                },
                {
                    name: 'single_certificate',
                    entity: [
                        {
                            type: 'file',
                            label: 'Upload File',
                            help: "Upload service account's certificate",
                            field: 'single_certificate',
                            options: {
                                fileSupportMessage: 'Here is the support message',
                                supportedFileTypes: ['json'],
                            },
                            encrypted: true,
                            required: true,
                            defaultValue: null,
                        },
                    ],
                    title: 'Certificate',
                },
                {
                    name: 'logging',
                    entity: [
                        {
                            type: 'singleSelect',
                            label: 'Log level',
                            options: {
                                disableSearch: true,
                                autoCompleteFields: [
                                    {
                                        value: 'DEBUG',
                                        label: 'DEBUG',
                                    },
                                    {
                                        value: 'INFO',
                                        label: 'INFO',
                                    },
                                    {
                                        value: 'WARN',
                                        label: 'WARN',
                                    },
                                    {
                                        value: 'ERROR',
                                        label: 'ERROR',
                                    },
                                    {
                                        value: 'CRITICAL',
                                        label: 'CRITICAL',
                                    },
                                ],
                            },
                            defaultValue: 'INFO',
                            field: 'loglevel',
                            encrypted: false,
                        },
                    ],
                    title: 'Logging',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'demo_input',
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                                {
                                    type: 'string',
                                    errorMsg: 'Length of input name should be between 1 and 100',
                                    minLength: 1,
                                    maxLength: 100,
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the data input.',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Interval',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg: 'Interval must be an integer.',
                                    pattern: '^\\-[1-9]\\d*$|^\\d*$',
                                },
                            ],
                            defaultValue: '300',
                            field: 'interval',
                            help: 'Time interval of the data input, in seconds.',
                            required: true,
                        },
                        {
                            type: 'singleSelect',
                            label: 'Account to use',
                            options: {
                                referenceName: 'account',
                            },
                            help: 'Account to use for this input.',
                            field: 'account',
                            required: true,
                        },
                    ],
                    title: 'demo_input',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'enable', 'delete', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Interval',
                        field: 'interval',
                    },
                    {
                        label: 'Index',
                        field: 'index',
                    },
                    {
                        label: 'Status',
                        field: 'disabled',
                    },
                ],
                moreInfo: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Interval',
                        field: 'interval',
                    },
                    {
                        label: 'Index',
                        field: 'index',
                    },
                    {
                        label: 'Status',
                        field: 'disabled',
                        mapping: {
                            true: 'Disabled',
                            false: 'Enabled',
                        },
                    },
                ],
            },
        },
        dashboard: {
            panels: [
                {
                    name: 'addon_version',
                },
                {
                    name: 'events_ingested_by_sourcetype',
                },
                {
                    name: 'errors_in_the_addon',
                },
            ],
        },
    },
    meta: {
        name: 'demo_addon_for_splunk',
        restRoot: 'demo_addon_for_splunk',
        version: '5.31.1R85f0e18e',
        displayName: 'Demo Add-on for Splunk',
        schemaVersion: '0.0.3',
    },
};
