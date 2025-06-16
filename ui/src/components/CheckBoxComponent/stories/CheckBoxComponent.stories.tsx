import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import CheckBoxComponent from '../CheckBoxComponent';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: CheckBoxComponent,
    title: 'CheckBoxComponent',
    decorators: [withControlGroup],
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
        handleChange: fn(),
        value: 0,
        field: 'field text',
        disabled: false,
    },
};
