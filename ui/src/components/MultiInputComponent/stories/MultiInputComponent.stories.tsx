import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import { http, HttpResponse } from 'msw';

import MultiInputComponent from '../MultiInputComponent';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';
import { getMockServerResponseForInput } from '../../../mocks/server-response';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: MultiInputComponent,
    title: 'MultiInputComponent',
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        const mockConfig = getGlobalConfigMock();
        setUnifiedConfig(mockConfig);

        const [state, setState] = useState(props?.value || ''); // eslint-disable-line react-hooks/rules-of-hooks
        return (
            <MultiInputComponent
                {...props}
                value={state}
                handleChange={(field, data) => {
                    setState(data);
                    props.handleChange(field, data);
                }}
            />
        );
    },
    decorators: [withControlGroup],
} satisfies Meta<typeof MultiInputComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
        field: 'field',
        controlOptions: {
            items: [
                { label: 'label1', value: 'value1' },
                { label: 'label2', value: 'value2' },
                { label: 'label3', value: 'value3' },
            ],
        },
    },
};

export const AllProps: Story = {
    args: {
        handleChange: fn(),
        field: 'field',
        controlOptions: {
            delimiter: ',',
            createSearchChoice: true,
            referenceName: 'referenceName',
            dependencies: undefined,
            endpointUrl: undefined,
            denyList: 'value1',
            allowList: 'string',
            labelField: 'labelField',
            items: [
                { label: 'label1', value: 'value1' },
                { label: 'label2', value: 'value2' },
                { label: 'label3', value: 'value3' },
            ],
        },
        disabled: false,
        value: undefined,
        dependencyValues: {},
    },
};

export const EndpointApi: Story = {
    args: {
        handleChange: fn(),
        field: 'field',
        controlOptions: {
            delimiter: ',',
            createSearchChoice: true,
            dependencies: undefined,
            denyList: undefined,
            allowList: undefined,
            labelField: 'testLabel',
            valueField: 'testValue',
            endpointUrl: '/demo_addon_for_splunk/some_API_endpint_for_select_data',
        },
        disabled: false,
        value: undefined,
        dependencyValues: {},
    },
    parameters: {
        msw: {
            handlers: [
                http.get('demo_addon_for_splunk/some_API_endpint_for_select_data', () =>
                    HttpResponse.json(
                        getMockServerResponseForInput([
                            {
                                name: 'dataFromApiTest1',
                                content: { testLabel: 'aaa1', testValue: 'bbb1' },
                            },
                            {
                                name: 'dataFromApiTest2',
                                content: { testLabel: 'aaa2', testValue: 'bbb2' },
                            },
                            {
                                name: 'dataFromApiTest3',
                                content: { testLabel: 'aaa3', testValue: 'bbb3' },
                            },
                            {
                                name: 'dataFromApiTest4',
                                content: { testLabel: 'aaa4', testValue: 'bbb4' },
                            },
                            {
                                name: 'd1',
                                content: { testLabel: 'firstLabel', testValue: 'firstValue' },
                            },
                            {
                                name: 'd2',
                                content: { testLabel: 'secondLabel', testValue: 'secondValue' },
                            },
                            {
                                name: 'd3',
                                content: { testLabel: 'thirdLabel', testValue: 'thirdValue' },
                            },
                            {
                                name: 'd4',
                                content: { testLabel: 'fourthLabel', testValue: 'fourthValue' },
                            },
                        ])
                    )
                ),
            ],
        },
    },
};
