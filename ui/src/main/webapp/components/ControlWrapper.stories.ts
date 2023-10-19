import type { Meta, StoryObj } from '@storybook/react';
import ControlWrapper from './ControlWrapper';

const meta = {
    component: ControlWrapper,
    title: 'Components/ControlWrapper',
} satisfies Meta<typeof ControlWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const props = {
    utilityFuncts: {
        utilCustomFunctions: {},
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
        defaultValue: null,
    },
    serviceName: 'settings',
    mode: 'config',
    disabled: false,
    dependencyValues: null,
    fileNameToDisplay: 'Previous File',
};

export const Base: Story = {
    args: props,
};
