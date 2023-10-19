import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import TextAreaComponent from './TextAreaComponent';

const Meta = {
    component: TextAreaComponent,
    title: 'Components/TextAreaComponent',
    render: (props) => {
        // due to stories incompatibility, eslint rule is off
        // React Hook "useState" is called in function "render" that is neither a React function component
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
} satisfies Meta<typeof TextAreaComponent>;

export default Meta;
type Story = StoryObj<typeof Meta>;

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
