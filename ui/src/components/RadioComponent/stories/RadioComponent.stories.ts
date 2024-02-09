import type { Meta, StoryObj } from '@storybook/react';
import RadioComponent from '../RadioComponent';

const meta = {
    component: RadioComponent,
    title: 'RadioComponent',
} satisfies Meta<typeof RadioComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        value: 'string',
        field: 'string',
        controlOptions: {
            items: [
                {
                    value: 'uniqueValue1',
                    label: 'label1',
                },
                {
                    value: 'uniqueValue2',
                    label: 'label2',
                },
                {
                    value: 'uniqueValue3',
                    label: 'label3',
                },
            ],
        },
        disabled: false,
    },
};
