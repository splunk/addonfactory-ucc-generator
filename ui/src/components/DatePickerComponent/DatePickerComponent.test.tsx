import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';

import DatePickerComponent from './DatePickerComponent';

const handleChange = vi.fn();

const setup = () =>
    render(<DatePickerComponent value="2025-21-05" handleChange={handleChange} field="fieldId" />);

it('should render text component correctly with value', async () => {
    setup();
    const date = screen.getByRole('combobox');

    expect(date).toHaveValue('2025-21-05');
});

it('should trigger callback correctly after typing', async () => {
    setup();
    const input = screen.getByRole('combobox');

    // Clear existing value
    await userEvent.clear(input);

    // Type a new date
    await userEvent.type(input, '05/25/2025');

    expect(handleChange).toHaveBeenCalledWith('fieldId', expect.stringContaining('2025-05-25'));
});

it('should use callback with empty string after clear', async () => {
    setup();
    const date = screen.getByRole('combobox');

    await userEvent.clear(date);
    expect(handleChange).toHaveBeenCalledWith('fieldId', '');
});
