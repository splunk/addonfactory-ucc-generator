import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import TextAreaComponent from '../TextAreaComponent';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: TextAreaComponent,
    title: 'TextAreaComponent',
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        const [value, setValue] = useState(props.value); // eslint-disable-line react-hooks/rules-of-hooks
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
    decorators: [withControlGroup],
} satisfies Meta<typeof TextAreaComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
        value: '',
        field: 'field',
        error: false,
        controlOptions: { rowsMax: 10, rowsMin: 2 },
        disabled: false,
    },
};
