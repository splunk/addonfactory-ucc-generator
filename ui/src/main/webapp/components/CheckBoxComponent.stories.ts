import type { Meta, StoryObj } from '@storybook/react';
import CheckBoxComponent from './CheckBoxComponent';

interface CheckBoxComponentProps {
    value: boolean;
    handleChange: (field: string, value: boolean) => void;
    field: string;
    disabled: boolean;
}

// function ComponentWrapper(props: CheckBoxComponentProps) {
//     return <CheckBoxComponent />;
// }

const meta = {
    component: CheckBoxComponent,
    title: 'Components/CheckBoxComponent',
} satisfies Meta<typeof CheckBoxComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

let tempValue = false;

export const Base: Story = {
    args: {
        value: tempValue,
        handleChange: (field: string, value: boolean) => {
            console.log('CheckBoxComponent handleChange', { field, value });
            tempValue = value;
        },
        field: 'field text',
        disabled: false,
    },
};
