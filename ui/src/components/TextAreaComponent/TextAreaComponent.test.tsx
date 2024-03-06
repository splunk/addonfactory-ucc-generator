import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import TextAreaComponent from './TextAreaComponent';

const handleChange = jest.fn();

beforeEach(() => {
    render(<TextAreaComponent value="test" handleChange={handleChange} field="fieldId" />);
});

it('should render text component correctly with value', async () => {
    const textBox = screen.getByRole('textbox');

    expect(textBox).toHaveValue('test');
});

it('should trigger callback correctly after typing', async () => {
    const textBox = screen.getByRole('textbox');

    await userEvent.type(textBox, 'f');
    expect(handleChange).toHaveBeenCalledWith('fieldId', 'testf');

    await userEvent.type(textBox, 'o');
    expect(handleChange).toHaveBeenCalledWith('fieldId', 'testo');
});

it('should use callback with empty string after clear', async () => {
    const textBox = screen.getByRole('textbox');

    await userEvent.clear(textBox);
    expect(handleChange).toHaveBeenCalledWith('fieldId', '');
});
