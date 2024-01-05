import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RadioComponent from './RadioComponent';

const handleChange = jest.fn();

interface AdditionalRadioProps {
    value?: string;
    field?: string;
    controlOptions?: {
        items: {
            value: string;
            label: string;
        }[];
    };
    disabled?: boolean;
}

const defaultRadioProps = {
    value: 'unexistingDefaultValue',
    field: 'testRadioField',
    controlOptions: {
        items: [
            {
                value: 'uniqueValue1',
                label: 'label1',
            },
            {
                value: 'uniqueValue2',
                label: 'label2',
            },
            {
                value: 'uniqueValue3',
                label: 'label3',
            },
        ],
    },
    disabled: false,
    handleChange,
};

const renderFeature = (additionalProps?: AdditionalRadioProps) => {
    const props = {
        ...defaultRadioProps,
        ...additionalProps,
    };
    render(<RadioComponent {...props} />);
};

it('renders correctly', () => {
    renderFeature();
    defaultRadioProps.controlOptions.items.forEach((option) => {
        const optionWithCorrectText = screen.getByText(option.label);
        expect(optionWithCorrectText).toBeInTheDocument();
        expect(optionWithCorrectText).not.toHaveAttribute('disabled');
    });
});

it('renders disabled', () => {
    renderFeature({ disabled: true });
    defaultRadioProps.controlOptions.items.forEach((option) => {
        const optionWithCorrectText = screen.getByText(option.label);
        expect(optionWithCorrectText).toBeInTheDocument();
        expect(optionWithCorrectText.parentElement).toHaveAttribute('disabled');
    });
});

it('clicks invoke callback correctly', async () => {
    renderFeature();
    const allRadioOptions = screen.getAllByRole('radio');
    const secondOption = allRadioOptions[1];

    expect(secondOption).toBeInTheDocument();
    await userEvent.click(secondOption);

    expect(handleChange).toHaveBeenCalledWith(
        defaultRadioProps.field,
        defaultRadioProps.controlOptions.items[1].value
    );

    const thirdOption = allRadioOptions[2];
    await userEvent.click(thirdOption);

    expect(handleChange).toHaveBeenCalledWith(
        defaultRadioProps.field,
        defaultRadioProps.controlOptions.items[2].value
    );

    const firstOption = allRadioOptions[0];
    await userEvent.click(firstOption);

    expect(handleChange).toHaveBeenCalledWith(
        defaultRadioProps.field,
        defaultRadioProps.controlOptions.items[0].value
    );
});

it('do not call change callback when already selected option clicked', async () => {
    renderFeature({ value: defaultRadioProps.controlOptions.items[0].value });

    const allRadioOptions = screen.getAllByRole('radio');

    await userEvent.click(allRadioOptions[1]);
    await userEvent.click(allRadioOptions[2]);
    await userEvent.click(allRadioOptions[0]); // selected option so no callback, as we never update state

    expect(handleChange).toHaveBeenCalledTimes(2);
});
