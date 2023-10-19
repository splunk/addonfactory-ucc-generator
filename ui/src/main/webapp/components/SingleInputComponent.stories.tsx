import type { Meta, StoryObj } from '@storybook/react';
import SingleInputComponent from './SingleInputComponent';
import { useState } from 'react';
import React from 'react';
import { setUnifiedConfig } from '../util/util';
import checkboxGroupConfig from './CheckboxGroup/checkboxGroupMocks.json';

const meta = {
    component: SingleInputComponent,
    title: 'Components/SingleInputComponent',
    render: (props) => {
        const [value, setValue] = useState(props.value);
        return (
            <SingleInputComponent
                {...props}
                handleChange={(field, data) => {
                    if (typeof data === 'string') setValue(data);
                    props.handleChange(field, data);
                }}
                value={value}
            />
        );
    },
} satisfies Meta<typeof SingleInputComponent>;

setUnifiedConfig(checkboxGroupConfig);

export default meta;
type Story = StoryObj<typeof meta>;

const common = {
    disabled: false,
    error: false,
    handleChange: (field: string, objValue: string | number | boolean) => {
        // eslint-disable-next-line
        console.log('handleChange', { field, objValue });
    },
    field: 'field',
    value: '',
    dependencyValues: undefined,
    controlOptions: {
        autoCompleteFields: [
            { label: 'aaa', value: 'aaa' },
            { label: 'bbb', value: 'bbb' },
            { label: 'ccc', value: 'ccc' },
            { label: 'ddd', value: 'ddd' },
            { label: 'test', value: 'test' },
            { label: 'test1', value: 'test1' },
            { label: 'test2', value: 'test2' },
            { label: 'test3', value: 'test3' },
            { label: 'test4', value: 'test4' },
            { label: 'test5', value: 'test5' },
        ],
        endpointUrl: undefined,
        denyList: 'denyList',
        allowList: 'allowList',
        dependencies: undefined,
        createSearchChoice: true,
        referenceName: undefined,
        disableSearch: true,
        labelField: 'labelField',
        hideClearBtn: false,
    },
    required: false,
};

export const SelectList: Story = {
    args: common,
};

export const AcceptAnyInput: Story = {
    args: {
        ...common,
        controlOptions: {
            createSearchChoice: true,
        },
    },
};

export const AllowDenyListFromBackend: Story = {
    args: {
        ...common,
        controlOptions: {
            ...common.controlOptions,
            allowList: 'test1',
            denyList: 'test1',
            referenceName: 'refernceName',
        },
    },
};
