import type { Meta, StoryObj } from '@storybook/react';
import FileInputComponent from './FileInputComponent';
import BaseFormView from '../BaseFormView';

const meta = {
    component: FileInputComponent,
    title: 'Components/FileInputComponent',
} satisfies Meta<typeof BaseFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

const common = {
    field: 'fileInptuComponent',
    controlOptions: {
        fileSupportMessage: 'test support message',
        supportedFileTypes: ['json', 'txt'],
        maxFileSize: 500,
    },
    disabled: false,
    handleChange: (field: string, data: string) => {
        // eslint-disable-next-line
        console.log('handleChange fileInptuComponent', { field, data });
    },
};

export const Base: Story = {
    args: common,
};

export const WithDefaultName: Story = {
    args: {
        ...common,
        fileNameToDisplay: 'Test_file_name.json',
    },
};

export const EncryptedWithDefaultName: Story = {
    args: {
        ...common,
        fileNameToDisplay: 'Test_file_name.json',
        encrypted: true,
    },
};
