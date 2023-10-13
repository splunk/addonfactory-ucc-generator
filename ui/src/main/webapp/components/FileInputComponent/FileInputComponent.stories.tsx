import type { Meta, StoryObj } from '@storybook/react';
import FileInputComponent from './FileInputComponent';
import BaseFormView from '../BaseFormView';

const meta = {
    component: FileInputComponent,
    title: 'Components/FileInputComponent',
} satisfies Meta<typeof BaseFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        field: 'fileInptuComponent',
        controlOptions: {
            fileSupportMessage: 'test support message',
            supportedFileTypes: ['json', 'txt'],
            maxFileSize: 500,
        },
        disabled: false,
        handleChange: (field: string, data: string) => {
            console.log('handleChange fileInptuComponent', { field, data });
        },
    },
};

export const WithDefaultName: Story = {
    args: {
        field: 'fileWithDefaultName',
        controlOptions: {
            fileSupportMessage: 'test support message',
            supportedFileTypes: ['json', 'txt'],
            maxFileSize: 500,
        },
        disabled: false,
        handleChange: (field: string, data: string) => {
            console.log('handleChange fileInptuComponent', { field, data });
        },
        fileNameToDisplay: 'Test_file_name.json',
    },
};

export const EncryptedWithDefaultName: Story = {
    args: {
        field: 'encryptedFileWithDefaultName',
        controlOptions: {
            fileSupportMessage: 'test support message',
            supportedFileTypes: ['json', 'txt'],
            maxFileSize: 500,
        },
        disabled: false,
        handleChange: (field: string, data: string) => {
            console.log('handleChange fileInptuComponent', { field, data });
        },
        fileNameToDisplay: 'Test_file_name.json',
        encrypted: true,
    },
};
