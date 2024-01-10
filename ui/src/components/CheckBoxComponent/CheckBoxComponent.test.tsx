import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import CheckBoxComponent from './CheckBoxComponent';

const handleChange = jest.fn();

it('should render checkbox correctly with default value', async () => {
    render(<CheckBoxComponent value handleChange={handleChange} field="fieldId" />);

    const checkboxElement = screen.getByTestId('switch');
    expect(checkboxElement).toBeInTheDocument();

    const checkboxElementBtn = screen.getByTestId('button');
    expect(checkboxElementBtn).toBeInTheDocument();

    expect(checkboxElementBtn).toBeChecked();
});

it('should correctly trigger callback with 0', async () => {
    render(<CheckBoxComponent value handleChange={handleChange} field="fieldId" />);

    const checkboxElementBtn = screen.getByTestId('button');
    expect(checkboxElementBtn).toBeInTheDocument();

    expect(checkboxElementBtn).toBeChecked();

    await userEvent.click(checkboxElementBtn);

    expect(handleChange).toHaveBeenCalledWith('fieldId', 0);
});

it('should correctly trigger callback with 1', async () => {
    render(<CheckBoxComponent value={false} handleChange={handleChange} field="fieldId" />);

    const checkboxElementBtn = screen.getByTestId('button');
    expect(checkboxElementBtn).toBeInTheDocument();

    expect(checkboxElementBtn).not.toBeChecked();

    await userEvent.click(checkboxElementBtn);

    expect(handleChange).toHaveBeenCalledWith('fieldId', 1);
});
