import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import TextComponent from './TextComponent';

describe('Text Component', () => {
    const handleChange = jest.fn();

    beforeEach(() => {
        render(<TextComponent value="test" handleChange={handleChange} field="fieldId" />);
    });

    it('should render text component correctly with value', async () => {
        const textElement = screen.getByTestId('text');
        expect(textElement).toBeInTheDocument();

        const textBox = screen.getByTestId('textbox');
        expect(textBox).toBeInTheDocument();

        expect(textBox).toHaveValue('test');
    });

    it('should trigger callback correctly after typing', async () => {
        const textBox = screen.getByTestId('textbox');

        await userEvent.type(textBox, 'f');
        expect(handleChange).toHaveBeenCalledWith('fieldId', 'testf');

        await userEvent.type(textBox, 'o');
        expect(handleChange).toHaveBeenCalledWith('fieldId', 'testo');
    });

    it('should use callback with empty string after clear', async () => {
        const textBox = screen.getByTestId('textbox');

        await userEvent.clear(textBox);
        expect(handleChange).toHaveBeenCalledWith('fieldId', '');
    });
});
