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
    value: 'rowUnderGroup1,requiredField',
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
                fields: ['requiredField', '160validation'],
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
                field: 'requiredField',
                checkbox: {
                    label: 'Required field',
                    defaultValue: false,
                },
            },
            {
                field: '160validation',
                checkbox: {
                    label: 'from 1 to 60 validation',
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
        expect(screen.getByLabelText('Required field')).toBeInTheDocument();
        expect(screen.getByLabelText('from 1 to 60 validation')).toBeInTheDocument();
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
