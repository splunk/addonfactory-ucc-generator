import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import FileInputComponent from '../FileInputComponent';

const meta = {
    component: FileInputComponent,
    title: 'FileInputComponent',
    parameters: {
        snapshots: {
            height: 300,
        },
    },
} satisfies Meta<typeof FileInputComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
        field: 'fileInptuComponent',
        controlOptions: {
            fileSupportMessage: 'test support message',
            supportedFileTypes: ['json', 'txt'],
            maxFileSize: 500,
        },
        disabled: false,
    },
};

export const WithDefaultName: Story = {
    args: {
        ...Base.args,
        fileNameToDisplay: 'Test_file_name.json',
    },
};

export const EncryptedWithDefaultName: Story = {
    args: {
        ...Base.args,
        fileNameToDisplay: 'Test_file_name.json',
        encrypted: true,
    },
};
