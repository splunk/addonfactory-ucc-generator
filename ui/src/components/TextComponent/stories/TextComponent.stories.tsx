import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import TextComponent from '../TextComponent';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: TextComponent,
    title: 'TextComponent',
    argTypes: { handleChange: { action: 'handleChange' } },
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        const [value, setValue] = useState(props.value); // eslint-disable-line react-hooks/rules-of-hooks
        return (
            <TextComponent
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
} satisfies Meta<typeof TextComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
        value: '',
        field: 'field',
        error: false,
        encrypted: false,
        disabled: false,
    },
};

export const AllPropsTrue: Story = {
    args: {
        handleChange: fn(),
        value: 'default value',
        field: 'field',
        error: true,
        encrypted: true,
        disabled: true,
    },
};
