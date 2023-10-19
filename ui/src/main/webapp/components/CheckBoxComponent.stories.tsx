import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import CheckBoxComponent from './CheckBoxComponent';

const meta = {
    component: CheckBoxComponent,
    title: 'Components/CheckBoxComponent',
    render: (props) => {
        const [state, setState] = useState(false);
        return (
            <CheckBoxComponent
                {...props}
                value={state}
                handleChange={() => {
                    setState(!state);
                    props.handleChange(props.field, !state);
                }}
            />
        );
    },
} satisfies Meta<typeof CheckBoxComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        value: false,
        handleChange: (field: string, value: boolean) => {
            // eslint-disable-next-line
            console.log('CheckBoxComponent handleChange', { field, value });
        },
        field: 'field text',
        disabled: false,
    },
};
