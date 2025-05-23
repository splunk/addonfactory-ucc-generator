import { expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxGroup from './CheckboxGroup';
import { CheckboxGroupProps } from './checkboxGroup.utils';
import { MODE_CREATE, MODE_EDIT } from '../../constants/modes';

const handleChange = vi.fn();

const defaultCheckboxProps: CheckboxGroupProps = {
    mode: MODE_CREATE,
    field: 'api',
    value: 'collect_collaboration/1200,collect_file/1,collect_task/1',
    controlOptions: {
        rows: [
            {
                field: 'collect_collaboration',
                checkbox: {
                    label: 'Collect folder collaboration',
                },
                input: {
                    defaultValue: 1200,
                    required: false,
                },
            },
            {
                field: 'collect_file',
                checkbox: {
                    label: 'Collect file metadata',
                },
                input: {
                    defaultValue: 1,
                    required: true,
                },
            },
            {
                field: 'collect_task',
                checkbox: {
                    label: 'Collect tasks and comments',
                },
                input: {
                    defaultValue: 1,
                    required: true,
                },
            },
        ],
    },
    handleChange,
};

const renderFeature = (additionalProps?: Partial<CheckboxGroupProps>) => {
    const props = {
        ...defaultCheckboxProps,
        ...additionalProps,
    };
    render(<CheckboxGroup {...props} />);
};

it('renders checkbox group correctly', async () => {
    renderFeature();
    defaultCheckboxProps.controlOptions.rows.forEach((row) => {
        const optionWithCorrectText = screen.getByText(row?.checkbox?.label || 'unexisting string');
        expect(optionWithCorrectText).toBeInTheDocument();
        expect(optionWithCorrectText.dataset?.disabled).toBeUndefined();
    });
});

it('renders disabled checkbox group correctly', async () => {
    renderFeature({ disabled: true });
    defaultCheckboxProps.controlOptions.rows.forEach((row) => {
        const optionWithCorrectText = screen.getByText(row?.checkbox?.label || 'unexisting string');
        expect(optionWithCorrectText).toBeInTheDocument();
        expect(optionWithCorrectText.dataset.disabled).toEqual('true');
    });
});

it('increment value correctly', async () => {
    renderFeature();
    const incrementButtons = screen.getAllByTestId('increment');
    const [firstIncrementer, secondIncrementer, thirdIncrementer] = incrementButtons;

    await userEvent.click(firstIncrementer);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1201,collect_file/1,collect_task/1',
        'checkboxGroup'
    );
    await userEvent.click(secondIncrementer);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1201,collect_file/2,collect_task/1',
        'checkboxGroup'
    );
    await userEvent.click(thirdIncrementer);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1201,collect_file/2,collect_task/2',
        'checkboxGroup'
    );
});

it('decrement value correctly', async () => {
    renderFeature();
    const decrementButtons = screen.getAllByTestId('decrement');
    const [firstDecrement, secondDecrement, thirdDecrement] = decrementButtons;

    await userEvent.click(firstDecrement);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1199,collect_file/1,collect_task/1',
        'checkboxGroup'
    );
    await userEvent.click(secondDecrement);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1199,collect_file/0,collect_task/1',
        'checkboxGroup'
    );
    await userEvent.click(thirdDecrement);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1199,collect_file/0,collect_task/0',
        'checkboxGroup'
    );
});

it('mixed incrementing and decrementing value correctly', async () => {
    renderFeature();
    const incrementButtons = screen.getAllByTestId('increment');
    const [firstIncrementer, secondIncrementer, thirdIncrementer] = incrementButtons;

    const decrementButtons = screen.getAllByTestId('decrement');
    const [firstDecrement, secondDecrement, thirdDecrement] = decrementButtons;

    await userEvent.click(firstDecrement);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1199,collect_file/1,collect_task/1',
        'checkboxGroup'
    );

    await userEvent.click(thirdIncrementer);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1199,collect_file/1,collect_task/2',
        'checkboxGroup'
    );

    await userEvent.click(secondDecrement);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1199,collect_file/0,collect_task/2',
        'checkboxGroup'
    );

    await userEvent.click(firstIncrementer);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1200,collect_file/0,collect_task/2',
        'checkboxGroup'
    );

    await userEvent.click(thirdDecrement);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        'collect_collaboration/1200,collect_file/0,collect_task/1',
        'checkboxGroup'
    );

    await userEvent.click(secondIncrementer);
    expect(handleChange).toHaveBeenCalledWith(
        defaultCheckboxProps.field,
        defaultCheckboxProps.value,
        'checkboxGroup'
    );
});

describe('CheckboxGroup behavior when disableOnEdit is enabled', () => {
    const verifyCheckboxesState = (expectedChecked: boolean) => {
        defaultCheckboxProps.controlOptions.rows.forEach((row) => {
            const checkbox = screen.getByLabelText(row?.checkbox?.label || 'unexisting string');
            expect(checkbox).toBeInTheDocument();
            expect(checkbox).toBeDisabled();

            if (expectedChecked) {
                expect(checkbox).toBeChecked();
            } else {
                expect(checkbox).not.toBeChecked();
            }
        });
    };

    it('should keep checkboxes checked after clicking "Clear All"', async () => {
        renderFeature({
            disabled: true,
            mode: MODE_EDIT,
            value: 'collect_collaboration/1200,collect_file/1,collect_task/1',
        });

        // Ensures Jest detects assertions inside verifyCheckboxesState and assertions are executed
        expect(() => verifyCheckboxesState(true)).not.toThrow();

        // Click "Clear All" button
        await userEvent.click(await screen.findByRole('button', { name: /clear all/i }));

        // Ensure assertions are executed
        expect(() => verifyCheckboxesState(true)).not.toThrow();
    });

    it('should keep checkboxes unchecked after clicking "Select All"', async () => {
        renderFeature({ disabled: true, mode: MODE_EDIT, value: '' });

        // Ensures Jest detects assertions inside verifyCheckboxesState and assertions are executed
        expect(() => verifyCheckboxesState(false)).not.toThrow();

        // Click "Select All" button
        await userEvent.click(await screen.findByRole('button', { name: /select all/i }));

        // Ensure assertions are executed
        expect(() => verifyCheckboxesState(false)).not.toThrow();
    });
});

describe('checkboxgroup behaviour when custom delimiter is added', () => {
    it('correctly handles select all action with delimiter in CheckboxGroup', async () => {
        const user = userEvent.setup();
        const controlOptionsWithDelimiter = {
            ...defaultCheckboxProps.controlOptions,
            delimiter: '|',
        };

        renderFeature({
            value: 'collect_collaboration/1200',
            controlOptions: controlOptionsWithDelimiter,
        });

        const selectAllButton = screen.getByRole('button', { name: 'Select All' });
        await user.click(selectAllButton);

        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

        const expectedValue = 'collect_collaboration/1200|collect_file/1|collect_task/1';

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('api', expectedValue, 'checkboxGroup');
    });

    it('updates value correctly for single checkbox toggle with custom delimiter', async () => {
        const user = userEvent.setup();
        const controlOptionsWithDelimiter = {
            ...defaultCheckboxProps.controlOptions,
            delimiter: '|',
        };

        renderFeature({
            value: 'collect_file/1',
            controlOptions: controlOptionsWithDelimiter,
        });

        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const expectedValue = 'collect_file/1|collect_collaboration/1200';

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('api', expectedValue, 'checkboxGroup');
    });
});
