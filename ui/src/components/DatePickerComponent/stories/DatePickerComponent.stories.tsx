import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import DatePickerComponent from '../DatePickerComponent';

const meta = {
    component: DatePickerComponent,
    title: 'DatePickerComponent',
    argTypes: {
        handleChange: { action: 'handleChange' },
        disabled: { control: 'boolean' },
    },
    render: (props) => {
        const [value, setValue] = useState(props.value);

        return (
            <DatePickerComponent
                {...props}
                value={value}
                handleChange={(field, newValue) => {
                    setValue(newValue);
                    props.handleChange(field, newValue);
                }}
            />
        );
    },
} satisfies Meta<typeof DatePickerComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        field: 'date',
        value: '2024-01-01',
        handleChange: fn(),
        disabled: false,
    },
};
