import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import CheckboxGroup from '../CheckboxGroup';
import { MODE_CREATE, MODE_EDIT } from '../../../constants/modes';
import { withControlGroup } from '../../../../.storybook/withControlGroup';

const meta = {
    component: CheckboxGroup,
    title: 'CheckboxGroup/Component',
    decorators: [withControlGroup],
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
        mode: MODE_EDIT,
        field: 'api',
        value: 'collect_collaboration/1200,collect_file/1,collect_task/1',
        controlOptions: {
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                    },
                    input: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                    input: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'collect_task',
                    checkbox: {
                        label: 'Collect tasks and comments',
                    },
                    input: {
                        defaultValue: 1,
                        required: true,
                    },
                },
            ],
        },
    },
};
export const Multiline: Story = {
    args: {
        handleChange: fn(),
        mode: MODE_EDIT,
        field: 'api',
        value: 'neigh/1,like/1',
        controlOptions: {
            rows: [
                {
                    field: 'like',
                    checkbox: {
                        label: 'I like ponies',
                    },
                },
                {
                    field: 'unicorn',
                    checkbox: {
                        label: 'Enable unicorn mode (Warning: May attract nearby ponies)',
                    },
                },
                {
                    field: 'neigh',
                    checkbox: {
                        label: "I agree to occasionally neigh like a pony when nobody's watching",
                    },
                },
            ],
        },
    },
};
export const WithSingleGroup: Story = {
    args: {
        ...Base.args,
        value: undefined,
        controlOptions: {
            groups: [
                {
                    label: 'Group 1',
                    fields: ['collect_collaboration', 'collect_file'],
                    options: { isExpandable: false },
                },
            ],
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                    },
                    input: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                    input: {
                        defaultValue: 1,
                        required: true,
                    },
                },
            ],
        },
    },
};
export const MixedWithGroups: Story = {
    args: {
        ...Base.args,
        value: undefined,
        controlOptions: {
            groups: [
                {
                    label: 'Expandable group',
                    fields: ['collect_collaboration', 'collect_file'],
                    options: { isExpandable: true, expand: true },
                },

                {
                    label: 'Non expandable group',
                    fields: ['collect_folder_metadata'],
                    options: { isExpandable: false },
                },
            ],
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                    },
                    input: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                    input: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'collect_task',
                    checkbox: {
                        label: 'Collect tasks and comments',
                    },
                    input: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'collect_folder_metadata',
                    checkbox: {
                        label: 'Collect folder metadata',
                    },
                    input: {
                        defaultValue: 3600,
                        required: true,
                    },
                },
            ],
        },
    },
};

export const CreateMode: Story = {
    args: {
        ...Base.args,
        value: undefined,
        mode: MODE_CREATE,
        controlOptions: {
            rows: [
                {
                    field: 'field1',
                    checkbox: {
                        label: 'Default true with value = 1200',
                        defaultValue: true,
                    },
                    input: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'field2',
                    checkbox: {
                        label: 'Default false with value = 2',
                        defaultValue: false,
                    },
                    input: {
                        defaultValue: 2,
                        required: true,
                    },
                },
            ],
        },
    },
};
