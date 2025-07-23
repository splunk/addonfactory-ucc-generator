import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';

import DatePickerComponent from './DatePickerComponent';

const handleChange = vi.fn();

const renderDate = (value = '2025-05-21') =>
    render(<DatePickerComponent value={value} handleChange={handleChange} field="fieldId" />);

it('should render text component correctly with value', async () => {
    renderDate();
    const date = screen.getByRole('combobox');

    expect(date).toHaveValue('5/21/2025');
});

it('should trigger callback correctly after typing', async () => {
    renderDate('');
    const input = screen.getByRole('combobox');
    const user = userEvent.setup();

    await user.type(input, '5/22/2025');
    await user.tab();
    expect(handleChange).toHaveBeenCalledWith('fieldId', '2025-05-22');
});

it('should use callback with empty string after clear', async () => {
    renderDate();
    const date = screen.getByRole('combobox');
    const user = userEvent.setup();

    await user.clear(date);
    await user.tab();

    expect(handleChange).toHaveBeenCalledWith('fieldId', '');
});
