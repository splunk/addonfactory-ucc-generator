import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import { http, HttpResponse } from 'msw';
import SingleInputComponent from '../SingleInputComponent';
import { setUnifiedConfig } from '../../../util/util';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { mockServerResponse } from '../../../mocks/server-response';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: SingleInputComponent,
    title: 'SingleInputComponent',
    parameters: {
        msw: {
            handlers: [
                http.get('/servicesNS/nobody/-/*', () => HttpResponse.json(mockServerResponse)),
            ],
        },
    },
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        const [value, setValue] = useState(props.value); // eslint-disable-line react-hooks/rules-of-hooks
        setUnifiedConfig(getGlobalConfigMock());

        return (
            <SingleInputComponent
                {...props}
                handleChange={(field, data) => {
                    if (typeof data === 'string') {
                        setValue(data);
                    }
                    props.handleChange(field, data);
                }}
                value={value}
            />
        );
    },
    decorators: [withControlGroup],
} satisfies Meta<typeof SingleInputComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const common = {
    handleChange: fn(),
    disabled: false,
    error: false,
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
