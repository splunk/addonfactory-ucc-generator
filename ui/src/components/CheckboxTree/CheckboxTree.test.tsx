import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxTree from './CheckboxTree';
import { MODE_CREATE } from '../../constants/modes';
import { CheckboxTreeProps } from './types';

const handleChange = jest.fn();

const defaultCheckboxProps: CheckboxTreeProps = {
    mode: MODE_CREATE,
    field: 'apis',
    value: 'rowUnderGroup1,firstRowUnderGroup3',
    label: 'CheckboxTree',
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

describe('CheckboxTree Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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

        // "Clear All"
        const clearAllButton = screen.getByText('Clear All');
        await user.click(clearAllButton);

        allCheckboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
        expect(handleChange).toHaveBeenCalledTimes(2);
    });
});
