import type { Meta, StoryObj } from '@storybook/react';
import TextAreaComponent from './TextAreaComponent';
import React, { useState } from 'react';

const meta = {
    component: TextAreaComponent,
    title: 'Components/TextAreaComponent',
    render: (props) => {
        const [value, setValue] = useState(props.value);
        return (
            <TextAreaComponent
                {...props}
                handleChange={(field, data) => {
                    setValue(data);
                    props.handleChange(field, data);
                }}
                value={value}
            />
        );
    },
} satisfies Meta<typeof TextAreaComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        value: '',
        handleChange: (field, data) => {
            // eslint-disable-next-line
            console.log('handleChange', { field, data });
        },
        field: 'field',
        error: false,
        controlOptions: { rowsMax: 10, rowsMin: 2 },
        disabled: false,
    },
};
