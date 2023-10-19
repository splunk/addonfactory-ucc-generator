import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import TextComponent from './TextComponent';

const meta = {
    component: TextComponent,
    title: 'Components/Temporary',
    argTypes: { handleChange: { action: 'handleChange' } },
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
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
} satisfies Meta<typeof TextComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        value: '',
        field: 'field',
        error: false,
        encrypted: false,
        disabled: false,
    },
};
