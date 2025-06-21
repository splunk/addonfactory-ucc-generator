import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxTree from './CheckboxTree';
import { MODE_CREATE } from '../../constants/modes';
import { CheckboxTreeProps } from './types';

const handleChange = vi.fn();

// Default props for the CheckboxTree component
const defaultCheckboxTreeProps: CheckboxTreeProps = {
    mode: MODE_CREATE,
    field: 'checkbox_field',
    value: 'rowUnderGroup1,firstRowUnderGroup3',
    label: 'checkboxTree',
    controlOptions: {
        groups: [
            {
                label: 'Group 1',
                options: {
                    isExpandable: true,
                    expand: true,
                },
                fields: ['rowUnderGroup1'],
            },
            {
                label: 'Group 3',
                options: {
                    isExpandable: true,
                    expand: true,
                },
                fields: ['firstRowUnderGroup3', 'secondRowUnderGroup3'],
            },
        ],
        rows: [
            {
                field: 'rowWithoutGroup',
                checkbox: {
                    label: 'Row without group',
                    defaultValue: false,
                },
            },
            {
                field: 'rowUnderGroup1',
                checkbox: {
                    label: 'Row under Group 1',
                    defaultValue: false,
                },
            },
            {
                field: 'firstRowUnderGroup3',
                checkbox: {
                    label: 'First row under Group 3',
                    defaultValue: false,
                },
            },
            {
                field: 'secondRowUnderGroup3',
                checkbox: {
                    label: 'Second row under Group 3',
                },
            },
        ],
    },
    handleChange,
};

// Utility function to render the CheckboxTree component with optional overrides
const renderCheckboxTree = (additionalProps?: Partial<CheckboxTreeProps>) => {
    const props = { ...defaultCheckboxTreeProps, ...additionalProps };
    render(<CheckboxTree {...props} />);
};

describe('CheckboxTree Component', () => {
    it('renders all rows and groups correctly', () => {
        renderCheckboxTree();

        // Verify group headers are rendered
        expect(screen.getByRole('checkbox', { name: 'Group 1' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Group 3' })).toBeInTheDocument();

        // Verify rows are rendered with correct labels
        expect(screen.getByLabelText('Row without group')).toBeInTheDocument();
        expect(screen.getByLabelText('Row under Group 1')).toBeInTheDocument();
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('Second row under Group 3')).toBeInTheDocument();
    });

    it('handles "Select All" and "Clear All" functionality', async () => {
        renderCheckboxTree();
        const user = userEvent.setup();

        // Verify "Select All" button functionality
        const selectAllButton = screen.getByRole('button', { name: 'Select All' });
        await user.click(selectAllButton);

        const allCheckboxes = screen.getAllByRole('checkbox');
        allCheckboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(
            'checkbox_field',
            'rowUnderGroup1,firstRowUnderGroup3,rowWithoutGroup,secondRowUnderGroup3',
            'checkboxTree'
        );

        // Verify "Clear All" button functionality
        const clearAllButton = screen.getByRole('button', { name: 'Clear All' });
        await user.click(clearAllButton);

        allCheckboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
        expect(handleChange).toHaveBeenCalledTimes(2);
        expect(handleChange).toHaveBeenLastCalledWith('checkbox_field', '', 'checkboxTree');
    });

    it('correctly handles select all action with delimiter in Checkboxtree', async () => {
        const user = userEvent.setup();
        const controlOptionsWithDelimiter = {
            ...defaultCheckboxTreeProps.controlOptions,
            delimiter: '|',
        };

        renderCheckboxTree({
            value: 'rowUnderGroup1|firstRowUnderGroup3',
            controlOptions: controlOptionsWithDelimiter,
        });

        const selectAllButton = screen.getByRole('button', { name: 'Select All' });
        await user.click(selectAllButton);

        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

        const expectedValue =
            'rowUnderGroup1|firstRowUnderGroup3|rowWithoutGroup|secondRowUnderGroup3';

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('checkbox_field', expectedValue, 'checkboxTree');
    });

    it('updates value correctly for single checkbox toggle with custom delimiter', async () => {
        const user = userEvent.setup();
        const controlOptionsWithDelimiter = {
            ...defaultCheckboxTreeProps.controlOptions,
            delimiter: '|',
        };

        renderCheckboxTree({
            value: 'rowUnderGroup1|firstRowUnderGroup3',
            controlOptions: controlOptionsWithDelimiter,
        });

        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        const expectedValue = 'rowUnderGroup1|firstRowUnderGroup3|rowWithoutGroup';

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('checkbox_field', expectedValue, 'checkboxTree');
    });
});

describe('CheckboxTree Component - Collapsed Groups', () => {
    it('renders groups in a collapsed state by default and toggles correctly', async () => {
        const user = userEvent.setup();
        renderCheckboxTree({
            controlOptions: {
                ...defaultCheckboxTreeProps.controlOptions,
                groups: [
                    {
                        label: 'Group 1',
                        options: {
                            isExpandable: true,
                            expand: false, // Group starts collapsed
                        },
                        fields: ['rowUnderGroup1'],
                    },
                    {
                        label: 'Group 3',
                        options: {
                            isExpandable: true,
                            expand: false, // Group starts collapsed
                        },
                        fields: ['firstRowUnderGroup3', 'secondRowUnderGroup3'],
                    },
                ],
            },
        });

        // Verify group headers are rendered
        expect(screen.getByRole('checkbox', { name: 'Group 1' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Group 3' })).toBeInTheDocument();

        // Verify rows under collapsed groups are not visible initially
        expect(screen.queryByLabelText('Row under Group 1')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('First row under Group 3')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Second row under Group 3')).not.toBeInTheDocument();

        // Expand Group 1 and verify rows are displayed
        const toggleGroup1Button = screen.getByRole('button', {
            name: 'Toggle for Group 1',
        });
        await user.click(toggleGroup1Button);
        expect(screen.getByLabelText('Row under Group 1')).toBeInTheDocument();

        // Expand Group 3 and verify rows are displayed
        const toggleGroup3Button = screen.getByRole('button', {
            name: 'Toggle for Group 3',
        });
        await user.click(toggleGroup3Button);
        expect(screen.getByLabelText('First row under Group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('Second row under Group 3')).toBeInTheDocument();
    });
});
