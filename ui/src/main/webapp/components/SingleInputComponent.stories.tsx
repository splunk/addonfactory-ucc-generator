import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import SingleInputComponent from './SingleInputComponent';
import { setUnifiedConfig } from '../util/util';
import checkboxGroupConfig from './CheckboxGroup/checkboxGroupMocks.json';

const meta = {
    component: SingleInputComponent,
    title: 'Components/SingleInputComponent',
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        const [value, setValue] = useState(props.value); // eslint-disable-line react-hooks/rules-of-hooks
        setUnifiedConfig(checkboxGroupConfig);

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
