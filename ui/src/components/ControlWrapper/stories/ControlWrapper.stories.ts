import type { Meta, StoryObj } from '@storybook/react';
import ControlWrapper from '../ControlWrapper';

const meta = {
    component: ControlWrapper,
    title: 'ControlWrapper',
    parameters: {
        snapshots: {
            height: 300,
        },
    },
} satisfies Meta<typeof ControlWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        utilityFuncts: {
            utilCustomFunctions: {
                setState: () => {},
                setErrorFieldMsg: () => {},
                clearAllErrorMsg: (state) => state,
                setErrorMsg: () => {},
            },
            handleChange: () => {},
            addCustomValidator: () => {},
        },
        value: '',
        display: true,
        error: false,
        entity: {
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
            defaultValue: undefined,
        },
        serviceName: 'settings',
        mode: 'config',
        disabled: false,
        dependencyValues: null,
        fileNameToDisplay: 'Previous File',
    },
};

export const WithModifications: Story = {
    args: {
        ...Base.args,
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            help: 'Enter the URL, for example',
            required: true,
            encrypted: false,
        },
        modifiedEntitiesData: { required: false, label: 'Modified URL', help: 'Modified help' },
    },
};

export const WithModificationsMakeRequired: Story = {
    args: {
        ...Base.args,
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            help: 'Enter the URL, for example',
            required: false,
            encrypted: false,
        },
        modifiedEntitiesData: {
            required: true,
            label: 'Modified URL',
            help: 'Modified help required',
        },
    },
};
