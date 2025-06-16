import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import RadioComponent from '../RadioComponent';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: RadioComponent,
    title: 'RadioComponent',
    decorators: [withControlGroup],
} satisfies Meta<typeof RadioComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
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
