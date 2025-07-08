import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { parseFunctionRawStr } from '../Validator';
import { setUnifiedConfig } from '../util';
import EntityModal from '../../components/EntityModal/EntityModal';

// Mock the API's postRequest function with a mock implementation
vi.mock('../api', async () => ({
    ...(await vi.importActual('../api')),
    postRequest: (await vi.importActual('../__mocks__/mockApi')).postRequest,
}));

describe('parseFunctionRawStr', () => {
    it('EntityModal: validates future start_date using saveValidator', async () => {
        const config = getGlobalConfigMock();

        if (!config.pages.inputs) {
            throw new Error('Missing inputs config in globalConfigMock');
        }

        config.pages.inputs.services[0].entity.push({
            type: 'text',
            label: 'Start Date',
            field: 'start_date',
            required: true,
        });

        // Add a custom saveValidator function that disallows future dates
        config.pages.inputs.services[0].options = {
            saveValidator: `function validate(data) {
                const now = new Date().getTime();
                const value = new Date(data.start_date).getTime();
                return value > now ? 'Start date should not be in future' : true;
            }`,
        };

        setUnifiedConfig(config);
        render(
            <EntityModal
                page="inputs"
                serviceName="demo_input"
                mode="create"
                formLabel="Start Date"
                open
                handleRequestClose={vi.fn()}
                returnFocus={() => {}}
                groupName=""
            />
        );

        // Fill required 'name' field
        await userEvent.type(screen.getByLabelText(/name/i), 'valid_name');

        // Fill required 'interval' field if present
        const intervalField = screen.queryByLabelText(/interval/i);
        if (intervalField) {
            await userEvent.clear(intervalField);
            await userEvent.type(intervalField, '300');
        }

        // Fill required 'account' field if present
        const accountField = screen.queryByLabelText(/account to use/i);
        if (accountField) {
            await userEvent.clear(accountField);
            await userEvent.type(accountField, 'default');
        }

        // Enter a future date to trigger validation error
        const startDateInput = screen.getAllByLabelText(/start date/i);
        await userEvent.type(startDateInput[1], new Date(Date.now() + 86400000).toISOString());

        // Click "Add" to attempt submission
        const addButton = screen.getByRole('button', { name: /add/i });
        await userEvent.click(addButton);

        // Assert that the validation message appears
        expect(screen.getByText(/start date should not be in future/i)).toBeInTheDocument();

        // Update to a valid past date
        await userEvent.type(startDateInput[1], new Date(Date.now() - 86400000).toISOString());
        await userEvent.click(addButton);

        // Assert that the validation message is now gone
        await waitFor(() => {
            expect(
                screen.queryByText(/start date should not be in future/i)
            ).not.toBeInTheDocument();
        });
    });

    // Valid arrow function string should parse correctly
    it('should parse a valid arrow function string', () => {
        const fnStr = '(data) => data.value === "valid"';
        const { error, result } = parseFunctionRawStr(fnStr);
        expect(error).toBeUndefined();
        expect(result?.({ value: 'valid' })).toBe(true);
    });

    // Malformed function string should return an error
    it('should return an error for a malformed function string', () => {
        const malformed = '(data => { return data. }';
        const { error, result } = parseFunctionRawStr(malformed);
        expect(error).toMatch(/is not a function/i);
        expect(result).toBeUndefined();
    });

    // Code that returns a string instead of function should error
    it('should return an error when code returns a non-function value', () => {
        const body = 'return "this is not a function";';
        const { error, result } = parseFunctionRawStr(body);
        expect(error).toMatch(/is not a function/i);
        expect(result).toBeUndefined();
    });

    // Named function string should parse and evaluate correctly
    it('should parse a named function string', () => {
        const fnStr = 'function validate(data) { return data.x === 5; }';
        const { error, result } = parseFunctionRawStr(fnStr);
        expect(error).toBeUndefined();
        expect(result?.({ x: 5 })).toBe(true);
    });

    // Function containing harmless console.log should work
    it('should handle harmless console-logging functions', () => {
        const fnStr = '(data) => { console.log("test case"); return true; }';
        const { error, result } = parseFunctionRawStr(fnStr);
        expect(error).toBeUndefined();
        expect(result?.({})).toBe(true);
    });

    // Empty function string should return error
    it('should return error for empty string', () => {
        const { error, result } = parseFunctionRawStr('');
        expect(error).toMatch(/is not a function/i);
        expect(result).toBeUndefined();
    });
});
