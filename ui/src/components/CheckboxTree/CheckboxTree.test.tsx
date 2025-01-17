import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxTree from './CheckboxTree';
import { MODE_CREATE } from '../../constants/modes';
import { CheckboxTreeProps } from './types';

const handleChange = jest.fn();

const defaultCheckboxProps: CheckboxTreeProps = {
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
                    label: 'first row under group 3',
                    defaultValue: false,
                },
            },
            {
                field: 'secondRowUnderGroup3',
                checkbox: {
                    label: 'second row under group 3',
                },
            },
        ],
    },
    handleChange,
};

const renderCheckboxTree = (additionalProps?: Partial<CheckboxTreeProps>) => {
    const props = { ...defaultCheckboxProps, ...additionalProps };
    render(<CheckboxTree {...props} />);
};

describe('checkboxTree Component', () => {
    it('renders all rows and groups correctly', () => {
        renderCheckboxTree();

        // Verify groups
        expect(screen.getByText('Group 1')).toBeInTheDocument();
        expect(screen.getByText('Group 3')).toBeInTheDocument();

        // Verify rows
        expect(screen.getByLabelText('Row without group')).toBeInTheDocument();
        expect(screen.getByLabelText('Row under Group 1')).toBeInTheDocument();
        expect(screen.getByLabelText('first row under group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('second row under group 3')).toBeInTheDocument();
    });

    it('handles "Select All" and "Clear All" functionality', async () => {
        renderCheckboxTree();
        const user = userEvent.setup();

        // "Select All"
        const selectAllButton = screen.getByText('Select All');
        await user.click(selectAllButton);

        const allCheckboxes = screen.getAllByRole('checkbox');
        allCheckboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(
            'checkbox_field',
            'rowUnderGroup1,firstRowUnderGroup3,rowWithoutGroup,secondRowUnderGroup3',
            'checkboxTree'
        );

        // "Clear All"
        const clearAllButton = screen.getByText('Clear All');
        await user.click(clearAllButton);

        allCheckboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
        expect(handleChange).toHaveBeenCalledTimes(2);
        expect(handleChange).toHaveBeenLastCalledWith('checkbox_field', '', 'checkboxTree');
    });
});

describe('checkboxTree Component - Collapsed Groups', () => {
    it('renders groups in a collapsed state by default and toggles correctly', async () => {
        const user = userEvent.setup();
        renderCheckboxTree({
            controlOptions: {
                ...defaultCheckboxProps.controlOptions,
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

        // Verify groups are rendered
        expect(screen.getByText('Group 1')).toBeInTheDocument();
        expect(screen.getByText('Group 3')).toBeInTheDocument();

        // Verify rows under collapsed groups are not visible
        expect(screen.queryByLabelText('Row under Group 1')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('first row under group 3')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('second row under group 3')).not.toBeInTheDocument();

        // Get all buttons
        const buttons = screen.getAllByRole('button');

        // Select the first button (for Group 1)
        const group1Button = buttons[0];
        expect(group1Button).toHaveAttribute('data-test', 'toggle'); // Verify it's the toggle button
        await user.click(group1Button); // Click Group 1 toggle button

        // Verify rows under "Group 1" are visible
        expect(screen.getByLabelText('Row under Group 1')).toBeInTheDocument();

        // Select the second button (for Group 3)
        const group3Button = buttons[1];
        expect(group3Button).toHaveAttribute('data-test', 'toggle'); // Verify it's the toggle button
        await user.click(group3Button); // Click Group 3 toggle button

        // Verify rows under "Group 3" are visible
        expect(screen.getByLabelText('first row under group 3')).toBeInTheDocument();
        expect(screen.getByLabelText('second row under group 3')).toBeInTheDocument();
    });
});
