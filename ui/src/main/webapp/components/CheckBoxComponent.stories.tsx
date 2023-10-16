import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import CheckBoxComponent from './CheckBoxComponent';

interface CheckBoxComponentProps {
    value: boolean;
    handleChange: (field: string, value: boolean) => void;
    field: string;
    disabled: boolean;
}

function ComponentWrapper(props: CheckBoxComponentProps) {
    const [state, setState] = useState(props.value);
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
}

const meta = {
    component: ComponentWrapper,
    title: 'Components/CheckBoxComponent',
} satisfies Meta<typeof ComponentWrapper>;

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
