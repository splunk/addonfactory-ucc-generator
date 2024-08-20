import React from 'react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';

import MultiInputComponent, { MultiInputComponentProps } from './MultiInputComponent';
import { server } from '../../mocks/server';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';
import { getMockServerResponseForInput } from '../../mocks/server-response';

const handleChange = jest.fn();

const defaultInputProps = {
    field: 'defaultFieldName',
    controlOptions: {
        delimiter: ',',
        createSearchChoice: true,
        referenceName: 'referenceName',
        dependencies: undefined,
        endpointUrl: undefined,
        labelField: 'labelField',
        items: [
            { label: 'label1', value: 'value1' },
            { label: 'label2', value: 'value2' },
            { label: 'label3', value: 'value3' },
        ],
    },
    disabled: false,
    value: 'defaultValue',
    error: false,
    dependencyValues: {},
    handleChange,
} satisfies MultiInputComponentProps;

const mockedEntries = [
    { name: 'dataApiTest1', content: { testLabel: 'firstLabel', testValue: 'firstValue' } },
    { name: 'dataApiTest2', content: { testLabel: 'secondLabel', testValue: 'secondValue' } },
    { name: 'dataApiTest3', content: { testLabel: 'thirdLabel', testValue: 'thirdValue' } },
    { name: 'dataApiTest4', content: { testLabel: 'fourthLabel', testValue: 'fourthValue' } },
];

const MOCK_API_URL = '/demo_addon_for_splunk/some_API_endpint_for_select_data';

const renderFeature = (additionalProps?: Partial<MultiInputComponentProps>) => {
    const props = {
        ...defaultInputProps,
        ...additionalProps,
    };
    render(<MultiInputComponent {...props} />);
};

const setConfig = () => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);
};

const mockAPI = () => {
    server.use(
        http.get(MOCK_API_URL, () =>
            HttpResponse.json(getMockServerResponseForInput(mockedEntries))
        )
    );
};

it('renders correctly', () => {
    renderFeature();
    const inputComponent = screen.getByTestId('multiselect');
    expect(inputComponent).toBeInTheDocument();
    expect(inputComponent.getAttribute('data-test-values')).toEqual(
        `["${defaultInputProps.value}"]`
    );
});

it('renders as disabled correctly', () => {
    renderFeature({ disabled: true });
    const inputComponent = screen.getByTestId('multiselect');
    expect(inputComponent).toBeInTheDocument();
    expect(inputComponent.getAttribute('aria-disabled')).toEqual('true');
});

it.each(defaultInputProps.controlOptions.items)('handler called correctly', async (item) => {
    renderFeature();
    const inputComponent = screen.getByTestId('multiselect');

    await userEvent.click(inputComponent);

    const option = document.querySelector(`[data-test-value="${item.value}"]`);

    expect(option).toBeInTheDocument();
    if (option) {
        await userEvent.click(option);
    }

    expect(handleChange).toHaveBeenCalledWith(
        defaultInputProps.field,
        `${defaultInputProps.value}${defaultInputProps.controlOptions.delimiter}${item.value}`
    );
});

it.each(mockedEntries)('handler endpoint data loading', async (mockedEntry) => {
    setConfig();
    mockAPI();

    renderFeature({
        controlOptions: {
            delimiter: ',',
            endpointUrl: MOCK_API_URL,
            dependencies: undefined,
        },
        value: undefined,
    });

    const inputComponent = screen.getByTestId('multiselect');
    expect(inputComponent).toBeInTheDocument();

    await userEvent.click(inputComponent);

    const apiEntry = mockedEntry;

    const option = document.querySelector(`[data-test-value="${apiEntry.name}"]`);
    expect(option).toBeInTheDocument();
    if (option) {
        await userEvent.click(option);
    }
    expect(handleChange).toHaveBeenCalledWith(defaultInputProps.field, apiEntry.name);
});

describe.each(mockedEntries)('handler endpoint data loading', (mockedEntry) => {
    it(`handler endpoint data loading content data - entry ${mockedEntry.name}`, async () => {
        setConfig();
        mockAPI();

        renderFeature({
            controlOptions: {
                delimiter: ',',
                createSearchChoice: true,
                endpointUrl: MOCK_API_URL,
                labelField: 'testLabel',
                valueField: 'testValue',
                dependencies: undefined,
            },
            value: undefined,
        });

        const inputComponent = screen.getByTestId('multiselect');
        expect(inputComponent).toBeInTheDocument();

        await userEvent.click(inputComponent);

        const apiEntry = mockedEntry;
        const option = document.querySelector(`[data-test-value="${apiEntry.content.testValue}"]`);
        expect(option).toBeInTheDocument();
        if (option) {
            await userEvent.click(option);
        }
        expect(handleChange).toHaveBeenCalledWith(
            defaultInputProps.field,
            apiEntry.content.testValue
        );
    });
});
