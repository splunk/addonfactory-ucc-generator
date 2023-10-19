import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import CheckBoxComponent from './CheckBoxComponent';

const meta = {
    component: CheckBoxComponent,
    title: 'Components/CheckBoxComponent',
    argTypes: { handleChange: { action: 'handleChange of state' } },
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

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        value: false,
        field: 'field text',
        disabled: false,
    },
};
