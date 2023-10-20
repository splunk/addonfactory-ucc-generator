import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import CustomTab from './CustomTab';
import { setUnifiedConfig } from '../util/util';

const meta = {
    component: CustomTab,
    title: 'Components/CustomTab',
    render: (props) => {
        // for visibility declared at bottom
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        setUnifiedConfig(unifiedConfig); // eslint-disable-line no-use-before-define
        return <CustomTab {...props} />;
    },
} satisfies Meta<typeof CustomTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        tab: {
            name: 'customtab',
            customTab: {
                actions: ['edit', 'delete', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                ],
                src: 'example',
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
            title: 'CustomTab',
        },
    },
};

// this const is used in render method
// declared here to not obfuscate code
const unifiedConfig = {
    meta: {
        name: 'demo_addon_for_splunk',
        restRoot: 'demo_addon_for_splunk',
        version: '5.31.1R85f0e18e',
        displayName: 'Demo Add-on for Splunk',
        schemaVersion: '0.0.3',
    },
};
