import React from 'react';

import { render, screen } from '@testing-library/react';
import MultiInputComponent, { MultiInputComponentProps } from './MultiInputComponent';

const handleChange = jest.fn();

const defaultInputProps: MultiInputComponentProps = {
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
};

const renderFeature = (additionalProps?: Partial<MultiInputComponentProps>) => {
    const props = {
        ...defaultInputProps,
        ...additionalProps,
    };
    render(<MultiInputComponent {...props} />);
};

it('renders correctly', () => {
    renderFeature();
    const inputComponent = screen.getByTestId('multiselect');
    expect(inputComponent).toBeInTheDocument();
    expect(inputComponent.getAttribute('data-test-values')).toEqual(
        // eslint-disable-next-line no-useless-escape
        `[\"${defaultInputProps.value}\"]`
    );
});

it('renders as disabled correctly', () => {
    renderFeature({ disabled: true });
    const inputComponent = screen.getByTestId('multiselect');
    expect(inputComponent).toBeInTheDocument();
    expect(inputComponent.getAttribute('aria-disabled')).toEqual('true');
});
