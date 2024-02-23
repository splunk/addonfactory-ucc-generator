import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import CheckBoxComponent from '../CheckBoxComponent';

const meta = {
    component: CheckBoxComponent,
    title: 'CheckBoxComponent',
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        const [state, setState] = useState<0 | 1>(props.value ? 1 : 0); // eslint-disable-line react-hooks/rules-of-hooks
        return (
            <CheckBoxComponent
                {...props}
                value={state}
                handleChange={() => {
                    setState(state ? 0 : 1);
                    props.handleChange(props.field, state ? 0 : 1);
                }}
            />
        );
    },
} satisfies Meta<typeof CheckBoxComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        value: 0,
        field: 'field text',
        disabled: false,
    },
};
