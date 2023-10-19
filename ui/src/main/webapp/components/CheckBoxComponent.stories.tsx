import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import CheckBoxComponent from './CheckBoxComponent';

const Meta = {
    component: CheckBoxComponent,
    title: 'Components/CheckBoxComponent',
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        const [state, setState] = useState(false); // eslint-disable-line react-hooks/rules-of-hooks
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

export default Meta;
type Story = StoryObj<typeof Meta>;

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
