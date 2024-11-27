import { render, screen } from '@testing-library/react';
import React from 'react';
import ControlWrapper, { ControlWrapperProps } from '../ControlWrapper';

const renderControlWrapper = (props: Partial<ControlWrapperProps>) => {
    render(
        <ControlWrapper
            mode="create"
            utilityFuncts={{
                utilCustomFunctions: {
                    setState: () => {},
                    setErrorFieldMsg: () => {},
                    clearAllErrorMsg: () => {},
                    setErrorMsg: () => {},
                },
                handleChange: () => {},
                addCustomValidator: () => {},
            }}
            value=""
            display
            error={false}
            disabled={false}
            serviceName="testServiceName"
            dependencyValues={undefined}
            entity={{
                field: 'url',
                label: 'URL',
                type: 'text',
                help: 'Enter the URL, for example',
                required: true,
                validators: [
                    {
                        errorMsg:
                            "Invalid URL provided. URL should start with 'https' as only secure URLs are supported. Provide URL in this format",
                        type: 'regex',
                        pattern: '^(https://)[^/]+/?$',
                    },
                ],
                encrypted: false,
            }}
            {...props}
        />
    );
};

it('check if required start displayed correctly', () => {
    renderControlWrapper({});
    const requiredStar = screen.queryByText('*');
    expect(requiredStar).toBeInTheDocument();
});

it('check if required start not displayed', () => {
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: false,
        },
    });
    const requiredStar = screen.queryByText('*');
    expect(requiredStar).not.toBeInTheDocument();
});

it('check if required start displayed correctly from modifiedEntitiesData', () => {
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: false,
        },
        modifiedEntitiesData: { required: true },
    });
    const requiredStar = screen.queryByText('*');
    expect(requiredStar).toBeInTheDocument();
});

it('check if required start not displayed due to modifiedEntitiesData', () => {
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: true,
        },
        modifiedEntitiesData: { required: false },
    });

    const requiredStar = screen.queryByText('*');
    expect(requiredStar).not.toBeInTheDocument();
});

it('check if label and help updated due to modifiedEntitiesData', () => {
    const modifications = { required: false, label: 'Modified URL', help: 'Modified help' };
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            help: 'Enter the URL, for example',
            type: 'text',
            required: true,
        },
        modifiedEntitiesData: modifications,
    });

    const label = screen.getByTestId('label'); // label replaced
    expect(label).toHaveTextContent(modifications.label);

    const help = screen.getByTestId('help'); // help replaced
    expect(help).toHaveTextContent(modifications.help);
});

it('check if help added due to modifiedEntitiesData', () => {
    const modifications = { help: 'Modified help' };

    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: true,
        },
        modifiedEntitiesData: modifications,
    });

    const help = screen.getByTestId('help');
    expect(help).toHaveTextContent(modifications.help);
});
