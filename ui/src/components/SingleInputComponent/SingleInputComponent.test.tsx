import React from 'react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { render, screen, within } from '@testing-library/react';

import SingleInputComponent, { SingleInputComponentProps } from './SingleInputComponent';
import { setUnifiedConfig } from '../../util/util';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { server } from '../../mocks/server';
import { getMockServerResponseForInput } from '../../mocks/server-response';

const handleChange = jest.fn();

const defaultInputProps = {
    field: 'defaultFieldName',
    controlOptions: {
        createSearchChoice: true,
        dependencies: undefined,
        endpointUrl: undefined,
        labelField: undefined,
        valueField: undefined,
        autoCompleteFields: [
            { label: 'label1', value: 'value1' },
            { label: 'label2', value: 'value2' },
            { label: 'label3', value: 'value3' },
        ],
    },
    disabled: false,
    value: 'defaultValue',
    error: false,
    dependencyValues: {},
    required: false,
    handleChange,
} satisfies SingleInputComponentProps;

beforeEach(() => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);
});

const renderFeature = (additionalProps?: Partial<SingleInputComponentProps>) => {
    const props = {
        ...defaultInputProps,
        ...additionalProps,
    };
    render(<SingleInputComponent {...props} />);
};

const mockedEntries = [
    { name: 'dataApiTest1', content: { testLabel: 'firstLabel', testValue: 'firstValue' } },
    { name: 'dataApiTest2', content: { testLabel: 'secondLabel', testValue: 'secondValue' } },
    { name: 'true', content: { testLabel: 'thirdLabel', testValue: 'thirdValue' } },
    { name: '0', content: { testLabel: 'fourthLabel', testValue: 'fourthValue' } },
];

const MOCK_API_URL = '/demo_addon_for_splunk/some_API_endpint_for_select_data';

const mockAPI = () => {
    server.use(
        http.get(MOCK_API_URL, () =>
            HttpResponse.json(getMockServerResponseForInput(mockedEntries))
        )
    );
};

it('renders correctly', () => {
    renderFeature();
    const inputComponent = screen.getByTestId('combo-box');
    expect(inputComponent).toBeInTheDocument();
    expect(inputComponent.getAttribute('data-test-value')).toEqual(defaultInputProps.value);
});

it('renders as disabled correctly', () => {
    renderFeature({ disabled: true });
    const inputComponent = screen.getByRole('combobox');
    expect(inputComponent).toBeInTheDocument();
    expect(inputComponent).toHaveAttribute('disabled');
});

it.each(defaultInputProps.controlOptions.autoCompleteFields)(
    'handler called correctly',
    async (item) => {
        renderFeature({ value: undefined });
        const inputComponent = screen.getByTestId('combo-box');

        await userEvent.click(inputComponent);

        const option = document.querySelector(`[data-test-value="${item.value}"]`);
        expect(option).toBeInTheDocument();
        if (option) {
            await userEvent.click(option);
        }
        expect(handleChange).toHaveBeenCalledWith(defaultInputProps.field, `${item.value}`);
    }
);

it('clear calls handler with empty data', async () => {
    renderFeature();
    const inputComponent = screen.getByTestId('combo-box');
    await userEvent.click(inputComponent);
    const clearBtn = screen.getByTestId('clear');
    await userEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith(defaultInputProps.field, ``);
});

describe.each(mockedEntries)('handler endpoint data loading', (entry) => {
    it(`handler called correctly with API data using labelField - entry ${entry.name}`, async () => {
        mockAPI();
        renderFeature({
            value: undefined,
            controlOptions: {
                createSearchChoice: true,
                dependencies: undefined,
                endpointUrl: MOCK_API_URL,
                labelField: 'testLabel',
                valueField: 'testValue',
            },
        });
        const inputComponent = screen.getByTestId('combo-box');
        await userEvent.click(inputComponent);

        const option = document.querySelector(`[data-test-value="${entry.content.testValue}"]`);
        expect(option).toBeInTheDocument();

        if (option) {
            await userEvent.click(option);
        }

        expect(handleChange).toHaveBeenCalledWith(
            defaultInputProps.field,
            `${entry.content.testValue}`
        );
    });
});

it('should render Select... when value does not exist in autoCompleteFields', () => {
    renderFeature({
        value: 'notExistingValue',
        controlOptions: {
            autoCompleteFields: [
                {
                    label: 'label1',
                    value: 'value1',
                },
            ],
        },
    });
    const inputComponent = screen.getByRole('combobox');
    expect(inputComponent).toBeInTheDocument();
    expect(within(inputComponent).getByText('Select...')).toBeInTheDocument();
});

it.each([
    { value: true, autoCompleteFields: [{ label: 'trueLabel', value: true }] },
    {
        value: false,
        autoCompleteFields: [{ label: 'falseLabel', value: false }],
    },
    { value: 0, autoCompleteFields: [{ label: 'falseLabel', value: '0' }] },
    { value: 0, autoCompleteFields: [{ label: 'falseLabel', value: 0 }] },
])('should render label with value $value', ({ value, autoCompleteFields }) => {
    renderFeature({
        value,
        controlOptions: { autoCompleteFields },
    });
    const inputComponent = screen.getByRole('combobox');
    const { label } = autoCompleteFields[0];
    expect(within(inputComponent).getByText(label)).toBeInTheDocument();
});

it('should fetch options from API when endpointUrl is provided', async () => {
    // server responses with a filtered mockedEntries based on the name parameter
    server.use(
        http.get(MOCK_API_URL, ({ request }) => {
            const url = new URL(request.url);

            const nameParameter = url.searchParams.get('name');
            return HttpResponse.json(
                getMockServerResponseForInput(
                    mockedEntries.filter((entry) => entry.name === nameParameter)
                )
            );
        })
    );
    const baseProps = {
        ...defaultInputProps,
        value: '',
        controlOptions: {
            createSearchChoice: true,
            dependencies: ['name', 'region'],
            endpointUrl: MOCK_API_URL,
            labelField: 'testLabel',
            valueField: 'testValue',
        },
    };
    const { rerender } = render(<SingleInputComponent {...baseProps} />);

    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('menuitem', { name: 'No matches' });

    // undefined value must be omitted
    const firstEntry = mockedEntries[0];
    rerender(
        <SingleInputComponent
            {...baseProps}
            dependencyValues={{ name: firstEntry.name, region: undefined }}
        />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('option', { name: firstEntry.content.testLabel });

    const secondEntry = mockedEntries[1];
    rerender(
        <SingleInputComponent
            {...baseProps}
            dependencyValues={{ name: secondEntry.name, region: 1 }}
        />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('option', { name: secondEntry.content.testLabel });

    const thirdEntry = mockedEntries[2];
    rerender(
        <SingleInputComponent {...baseProps} dependencyValues={{ name: true, region: false }} />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('option', { name: thirdEntry.content.testLabel });

    const fourthEntry = mockedEntries[3];
    rerender(<SingleInputComponent {...baseProps} dependencyValues={{ name: 0, region: 0 }} />);
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('option', { name: fourthEntry.content.testLabel });
});
