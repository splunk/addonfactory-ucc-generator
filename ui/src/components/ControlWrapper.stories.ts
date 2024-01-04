import type { Meta, StoryObj } from '@storybook/react';
import ControlWrapper from './ControlWrapper';

const meta = {
    component: ControlWrapper,
    title: 'Components/ControlWrapper',
} satisfies Meta<typeof ControlWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        utilityFuncts: {
            utilCustomFunctions: {
                setState: () => {},
                setErrorFieldMsg: () => {},
                clearAllErrorMsg: () => {},
                setErrorMsg: () => {},
            },
            handleChange(): void {
                throw new Error('Function not implemented.');
            },
            addCustomValidator(): void {
                throw new Error('Function not implemented.');
            },
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
        },
        serviceName: 'settings',
        mode: 'config',
        disabled: false,
        dependencyValues: null,
        fileNameToDisplay: 'Previous File',
    },
};
